import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { BridgeService } from './bridge.service';

export interface AuthUser {
    /** Stable user identifier — Apple sub or generated local ID */
    userId: string;
    displayName: string;
    email?: string;
    /** Unique @handle chosen at signup — lowercase, 3-20 chars */
    username?: string;
    /** Short shareable code others use to find you */
    friendCode: string;
    /** Whether this account was created via Apple Sign In */
    provider: 'apple' | 'local';
}

const AUTH_KEY = 'cg_auth_user';
const LOCAL_CREDS_KEY = 'cg_local_creds';

interface LocalCreds {
    email: string;
    passwordHash: string;
}

function generateFriendCode(): string {
    const adj = ['ACE', 'PAR', 'BRD', 'EGL', 'HOL', 'TIG', 'ALB', 'CHI'];
    const nums = Math.floor(1000 + Math.random() * 9000).toString();
    return adj[Math.floor(Math.random() * adj.length)] + '-' + nums;
}

function generateLocalId(): string {
    return 'local_' + Math.random().toString(36).slice(2, 11);
}

async function sha256(text: string): Promise<string> {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private storage = inject(StorageService);
    private bridge = inject(BridgeService);

    private _user = signal<AuthUser | null>(this.storage.get<AuthUser | null>(AUTH_KEY, null));

    readonly user = this._user.asReadonly();
    readonly isLoggedIn = computed(() => this._user() !== null);

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

    /** Create a new local account with email + password. */
    async signUpLocal(displayName: string, email: string, password: string): Promise<void> {
        const existing = this.storage.get<LocalCreds | null>(LOCAL_CREDS_KEY, null);
        if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
            throw new Error('An account with this email already exists.');
        }
        const passwordHash = await sha256(password);
        const creds: LocalCreds = { email: email.toLowerCase(), passwordHash };
        this.storage.set(LOCAL_CREDS_KEY, creds);

        const authUser: AuthUser = {
            userId: generateLocalId(),
            displayName,
            email,
            friendCode: generateFriendCode(),
            provider: 'local',
        };
        this.storage.set(AUTH_KEY, authUser);
        this._user.set(authUser);
    }

    /** Sign in with a previously created local account. */
    async signInLocal(email: string, password: string): Promise<void> {
        const creds = this.storage.get<LocalCreds | null>(LOCAL_CREDS_KEY, null);
        if (!creds || creds.email !== email.toLowerCase()) {
            throw new Error('No account found for this email.');
        }
        const passwordHash = await sha256(password);
        if (creds.passwordHash !== passwordHash) {
            throw new Error('Incorrect password.');
        }
        const existing = this._user();
        if (existing?.provider === 'local') {
            // Already have the profile — just re-authenticate
            return;
        }
        // Shouldn't happen, but restore profile from stored user
        const stored = this.storage.get<AuthUser | null>(AUTH_KEY, null);
        if (stored) {
            this._user.set(stored);
        }
    }

    /** Verify the stored credential is still valid against Apple's servers. */
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
    }

    signOut(): void {
        this.storage.remove(AUTH_KEY);
        this._user.set(null);
    }

    /**
     * Permanently delete this account and wipe ALL app data from localStorage.
     * After calling this, redirect the user to the login screen.
     */
    deleteAccount(): void {
        const ALL_KEYS = [
            AUTH_KEY,
            LOCAL_CREDS_KEY,
            'cg_rounds',
            'cg_courses',
            'cg_players',
            'cg_trophies',
        ];
        ALL_KEYS.forEach(k => this.storage.remove(k));
        this._user.set(null);
    }
}

