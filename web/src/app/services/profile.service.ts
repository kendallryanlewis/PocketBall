import { Injectable, inject, effect } from '@angular/core';
import {
    doc, setDoc, getDocs, getDoc,
    collection, where, limit,
    query as fsQuery,
} from 'firebase/firestore';
import { AuthService } from './auth.service';
import { getFirestoreDb } from '../firebase.config';

/** Public profile stored in `profiles/{userId}`. Anyone authenticated can read; only owner writes. */
export interface PublicProfile {
    userId: string;
    displayName: string;
    /** Lowercase @handle, unique. Used for search. */
    username?: string;
    /** Email address — stored lowercase for exact-match search. */
    email?: string;
    photoURL?: string;
    friendCode: string;
    /** Club yardages — shared publicly so friends can see your distances. */
    clubs: { id: string; name: string; yards: number | null }[];
    updatedAt: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private auth = inject(AuthService);

    constructor() {
        // Whenever the signed-in user changes, push their public profile to Firestore.
        effect(() => {
            const user = this.auth.user();
            if (user?.userId) {
                this.upsert({
                    userId: user.userId,
                    displayName: user.displayName,
                    username: user.username?.toLowerCase(),
                    email: user.email,
                    photoURL: user.photoURL,
                    friendCode: user.friendCode,
                });
            }
        });
    }

    /** Write or merge fields into the public profile document. */
    async upsert(data: Partial<PublicProfile> & { userId: string }): Promise<void> {
        const db = getFirestoreDb();
        const payload = { ...data, updatedAt: Date.now() };

        // Always write to the private users/ path (guaranteed by existing rules)
        try {
            await setDoc(
                doc(db, 'users', data.userId, 'settings', 'profile'),
                payload,
                { merge: true },
            );
        } catch { }

        // Best-effort write to the public profiles/ collection
        try {
            await setDoc(
                doc(db, 'profiles', data.userId),
                payload,
                { merge: true },
            );
        } catch { }
    }

    /**
     * Sync the user's club yardages into their public profile so other users
     * can see "what does [friend] carry?".
     */
    async updateClubs(userId: string, clubs: { id: string; name: string; yards: number | null }[]): Promise<void> {
        try {
            await setDoc(
                doc(getFirestoreDb(), 'profiles', userId),
                { clubs, updatedAt: Date.now() },
                { merge: true },
            );
        } catch { }
    }

    /**
     * Resize a profile photo to 160×160 JPEG, persist in localStorage immediately
     * (so it shows even offline), then write to Firestore for cross-device sync.
     * Uses FileReader instead of createObjectURL for WKWebView compatibility.
     */
    async uploadPhoto(userId: string, file: File): Promise<string> {
        const dataUrl = await this.resizeToDataUrl(file, 160);

        // Persist locally so the photo appears instantly, even offline
        try { localStorage.setItem(`profile_photo_${userId}`, dataUrl); } catch { }

        const db = getFirestoreDb();
        const now = Date.now();

        // Primary write: users/{userId}/settings — same path as clubs, always works
        try {
            await setDoc(
                doc(db, 'users', userId, 'settings', 'profile'),
                { photoURL: dataUrl, updatedAt: now },
                { merge: true },
            );
        } catch (e: any) {
            console.warn('[ProfileService] Private photo write failed:', e?.code ?? e);
        }

        // Secondary write: profiles/{userId} — public, needs Firestore rules to be set up
        try {
            await setDoc(
                doc(db, 'profiles', userId),
                { photoURL: dataUrl, updatedAt: now },
                { merge: true },
            );
        } catch (e: any) {
            // Silently skip — likely missing Firestore rules for profiles collection
            console.warn('[ProfileService] Public profile photo write failed:', e?.code ?? e?.message ?? e);
        }

        return dataUrl;
    }

    /** Read the locally cached photo for a userId (fallback when offline). */
    getCachedPhoto(userId: string): string | null {
        try { return localStorage.getItem(`profile_photo_${userId}`); } catch { return null; }
    }

    private resizeToDataUrl(file: File, maxPx: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('FileReader failed to read image'));
            reader.onload = (readerEvt) => {
                const src = readerEvt.target?.result as string;
                if (!src) { reject(new Error('Empty image data')); return; }

                const img = new Image();
                img.onerror = () => reject(new Error('Image failed to decode'));
                img.onload = () => {
                    try {
                        const scale = Math.min(1, maxPx / Math.max(img.width, img.height, 1));
                        const w = Math.max(1, Math.round(img.width * scale));
                        const h = Math.max(1, Math.round(img.height * scale));
                        const canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
                        ctx.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', 0.72));
                    } catch (e) {
                        reject(e);
                    }
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Search profiles by email (exact), username prefix, or displayName prefix.
     * Tries all three in parallel and merges de-duped results.
     */
    async searchUsers(rawQuery: string): Promise<PublicProfile[]> {
        const term = rawQuery.trim().toLowerCase().replace(/^@/, '');
        if (!term) return [];

        const db = getFirestoreDb();
        const seen = new Set<string>();
        const merged: PublicProfile[] = [];
        const push = (d: any) => {
            const p = d.data() as PublicProfile;
            if (!seen.has(p.userId)) { seen.add(p.userId); merged.push(p); }
        };

        try {
            // Exact friend-code match (format: ACE-1234)
            if (/^[a-z]{3}-\d{4}$/i.test(term)) {
                const snap = await getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('friendCode', '==', term.toUpperCase()),
                ));
                snap.forEach(push);
                return merged;
            }

            const end = term + '\uf8ff';

            // Run email exact, username prefix, and displayName prefix in parallel
            const [emailSnap, usernameSnap, nameSnap] = await Promise.allSettled([
                // Exact email match (emails stored lowercase)
                getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('email', '==', term),
                    limit(5),
                )),
                // Username prefix
                getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('username', '>=', term),
                    where('username', '<=', end),
                    limit(10),
                )),
                // DisplayName prefix
                getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('displayName', '>=', rawQuery.trim()),
                    where('displayName', '<=', rawQuery.trim() + '\uf8ff'),
                    limit(10),
                )),
            ]);

            if (emailSnap.status === 'fulfilled') emailSnap.value.forEach(push);
            if (usernameSnap.status === 'fulfilled') usernameSnap.value.forEach(push);
            if (nameSnap.status === 'fulfilled') nameSnap.value.forEach(push);
        } catch {
            // Firestore unavailable or rules error.
        }

        return merged.slice(0, 10);
    }

    /** Fetch a single public profile by userId. */
    async getProfile(userId: string): Promise<PublicProfile | null> {
        try {
            const snap = await getDoc(doc(getFirestoreDb(), 'profiles', userId));
            return snap.exists() ? (snap.data() as PublicProfile) : null;
        } catch {
            return null;
        }
    }
}
