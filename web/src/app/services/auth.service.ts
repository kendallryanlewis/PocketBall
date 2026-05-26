import { Injectable, signal, computed, inject } from '@angular/core';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signOut as firebaseSignOut,
    deleteUser,
    onAuthStateChanged,
    Auth,
} from 'firebase/auth';
import { StorageService } from './storage.service';
import { BridgeService } from './bridge.service';
import { getFirebaseApp } from '../firebase.config';

export interface AuthUser {
    /** Stable user identifier — Firebase UID or Apple sub */
    userId: string;
    displayName: string;
    email?: string;
    /** Unique @handle chosen at signup — lowercase, 3-20 chars */
    username?: string;
    /** Short shareable code others use to find you */
    friendCode: string;
    /** Whether this account was created via Apple Sign In */
    provider: 'apple' | 'local';
    /** Firebase Storage URL for the user's profile photo */
    photoURL?: string;
}

const AUTH_KEY = 'cg_auth_user';

function generateFriendCode(): string {
    const adj = ['ACE', 'PAR', 'BRD', 'EGL', 'HOL', 'TIG', 'ALB', 'CHI'];
    const nums = Math.floor(1000 + Math.random() * 9000).toString();
    return adj[Math.floor(Math.random() * adj.length)] + '-' + nums;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private storage = inject(StorageService);
    private bridge = inject(BridgeService);

    private auth: Auth;
    /** True once Firebase has confirmed at least one authenticated session. */
    private _hadFirebaseSession = false;

    private _user = signal<AuthUser | null>(this.storage.get<AuthUser | null>(AUTH_KEY, null));

    readonly user = this._user.asReadonly();
    readonly isLoggedIn = computed(() => this._user() !== null);

    constructor() {
        try {
            const app = getFirebaseApp();
            this.auth = getAuth(app);

            // Keep local signal in sync with Firebase Auth state.
            // Only clear the user when Firebase transitions from an active session
            // to null (e.g. token expired / deleted). On first load, if Firebase
            // reports null and the user has a cached local session (pre-Firebase
            // migration), leave them logged in so they aren't unexpectedly evicted.
            onAuthStateChanged(this.auth, (firebaseUser) => {
                if (firebaseUser) {
                    this._hadFirebaseSession = true;
                    const existing = this._user();
                    // Also check the dedicated photo cache key written by ProfileService
                    const cachedPhoto = (() => { try { return localStorage.getItem(`profile_photo_${firebaseUser.uid}`); } catch { return null; } })();
                    const authUser: AuthUser = {
                        userId: firebaseUser.uid,
                        displayName: firebaseUser.displayName ?? existing?.displayName ?? 'Golfer',
                        email: firebaseUser.email ?? undefined,
                        username: existing?.username,
                        friendCode: existing?.friendCode ?? generateFriendCode(),
                        provider: existing?.provider ?? 'local',
                        photoURL: firebaseUser.photoURL ?? existing?.photoURL ?? cachedPhoto ?? undefined,
                    };
                    this.storage.set(AUTH_KEY, authUser);
                    this._user.set(authUser);
                } else if (this._hadFirebaseSession) {
                    // Firebase confirmed a session existed, then it went away
                    // (token expired, account deleted, or explicit sign-out).
                    // Clear the local user — but leave Apple users alone since
                    // their auth state is managed by the native bridge.
                    const current = this._user();
                    if (!current || current.provider !== 'apple') {
                        this.storage.remove(AUTH_KEY);
                        this._user.set(null);
                    }
                }
                // else: Firebase resolved null on first load and we never had a
                // Firebase session — keep existing cached user as-is.
            });
        } catch (e) {
            console.warn('[Auth] Firebase init failed — running offline:', e);
            this.auth = null as unknown as Auth;
        }
    }

    /** Sign in with Apple via the native bridge. Resolves when done. */
    async signInWithApple(): Promise<void> {
        const resultPromise = this.bridge.once<{
            userId: string; displayName: string; email?: string;
        }>('appleAuthResult');

        this.bridge.send('signInWithApple', {});
        const info = await resultPromise;

        const existing = this._user();
        const authUser: AuthUser = {
            userId: info.userId,
            displayName: info.displayName || 'Golfer',
            email: info.email,
            friendCode: existing?.friendCode ?? generateFriendCode(),
            provider: 'apple',
        };
        this.storage.set(AUTH_KEY, authUser);
        this._user.set(authUser);
    }

    /** Create a new account with email + password via Firebase Auth. */
    async signUpLocal(displayName: string, email: string, password: string): Promise<void> {
        if (!this.auth) throw new Error('Authentication service unavailable.');

        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        await updateProfile(credential.user, { displayName });

        const authUser: AuthUser = {
            userId: credential.user.uid,
            displayName,
            email,
            friendCode: generateFriendCode(),
            provider: 'local',
        };
        this.storage.set(AUTH_KEY, authUser);
        this._user.set(authUser);
    }

    /** Sign in with email + password via Firebase Auth. */
    async signInLocal(email: string, password: string): Promise<void> {
        if (!this.auth) throw new Error('Authentication service unavailable.');

        const credential = await signInWithEmailAndPassword(this.auth, email, password);

        const existing = this._user();
        // Try to recover friendCode from Firestore if not in localStorage
        let friendCode = existing?.friendCode;
        if (!friendCode) {
            try {
                const { getFirestoreDb } = await import('../firebase.config');
                const { doc: fsDoc, getDoc: fsGetDoc } = await import('firebase/firestore');
                const snap = await fsGetDoc(fsDoc(getFirestoreDb(), 'profiles', credential.user.uid));
                if (snap.exists()) friendCode = (snap.data() as any).friendCode;
            } catch { }
        }

        const authUser: AuthUser = {
            userId: credential.user.uid,
            displayName: credential.user.displayName ?? existing?.displayName ?? 'Golfer',
            email: credential.user.email ?? undefined,
            username: existing?.username,
            friendCode: friendCode ?? generateFriendCode(),
            provider: 'local',
        };
        this.storage.set(AUTH_KEY, authUser);
        this._user.set(authUser);
    }

    /** Send a Firebase password reset email. */
    async sendPasswordReset(email: string): Promise<void> {
        if (!this.auth) throw new Error('Authentication service unavailable.');
        await sendPasswordResetEmail(this.auth, email);
    }

    /** Verify the stored Apple credential is still valid. */
    async checkCredential(): Promise<void> {
        const u = this._user();
        if (!u || u.provider !== 'apple' || !this.bridge.available) return;

        const statePromise = this.bridge.once<{ state: string }>('appleCredentialState');
        this.bridge.send('checkAppleCredential', { userId: u.userId });
        const { state } = await statePromise;

        if (state === 'revoked' || state === 'notFound') {
            this.signOut();
        }
    }

    updateDisplayName(name: string): void {
        const u = this._user();
        if (!u) return;
        const updated = { ...u, displayName: name };
        this.storage.set(AUTH_KEY, updated);
        this._user.set(updated);

        // Also update Firebase Auth profile if available
        if (this.auth?.currentUser) {
            updateProfile(this.auth.currentUser, { displayName: name }).catch(() => { });
        }
    }

    updateUsername(username: string): void {
        const u = this._user();
        if (!u) return;
        const updated = { ...u, username: username.toLowerCase().trim() };
        this.storage.set(AUTH_KEY, updated);
        this._user.set(updated);
    }

    updatePhotoURL(photoURL: string): void {
        const u = this._user();
        if (!u) return;
        const updated = { ...u, photoURL };
        this.storage.set(AUTH_KEY, updated);
        this._user.set(updated);

        if (this.auth?.currentUser) {
            updateProfile(this.auth.currentUser, { photoURL }).catch(() => { });
        }
    }

    signOut(): void {
        this.storage.remove(AUTH_KEY);
        this._user.set(null);
        if (this.auth) {
            firebaseSignOut(this.auth).catch(() => { });
        }
    }

    /**
     * Permanently delete this account and wipe ALL app data from localStorage.
     * After calling this, redirect the user to the login screen.
     */
    async deleteAccount(): Promise<void> {
        const ALL_KEYS = [AUTH_KEY, 'cg_rounds', 'cg_courses', 'cg_players', 'cg_trophies'];

        // Delete Firebase Auth account if possible
        if (this.auth?.currentUser) {
            try {
                await deleteUser(this.auth.currentUser);
            } catch {
                // If re-auth is needed the user will be signed out anyway
            }
        }

        ALL_KEYS.forEach(k => this.storage.remove(k));
        this._user.set(null);
    }
}

