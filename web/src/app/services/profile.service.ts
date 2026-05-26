import { Injectable, inject, effect } from '@angular/core';
import {
    doc, setDoc, getDocs, getDoc,
    collection, where, limit,
    query as fsQuery,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthService } from './auth.service';
import { getFirestoreDb, getFirebaseApp } from '../firebase.config';

/** Public profile stored in `profiles/{userId}`. Anyone authenticated can read; only owner writes. */
export interface PublicProfile {
    userId: string;
    displayName: string;
    /** Lowercase @handle, unique. Used for search. */
    username?: string;
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
        try {
            const db = getFirestoreDb();
            await setDoc(
                doc(db, 'profiles', data.userId),
                { ...data, updatedAt: Date.now() },
                { merge: true },
            );
        } catch {
            // Offline or Firestore not yet enabled — fail silently.
        }
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
     * Upload a profile photo to Firebase Storage and return the public download URL.
     * The caller should then persist the URL via `AuthService.updatePhotoURL()`.
     */
    async uploadPhoto(userId: string, file: File): Promise<string> {
        const storage = getStorage(getFirebaseApp());
        const photoRef = ref(storage, `profile-photos/${userId}`);
        await uploadBytes(photoRef, file);
        return getDownloadURL(photoRef);
    }

    /**
     * Search the public profiles collection by @username prefix or exact friend code.
     * Returns up to 10 matches.
     */
    async searchUsers(rawQuery: string): Promise<PublicProfile[]> {
        const term = rawQuery.trim().toLowerCase().replace(/^@/, '');
        if (!term) return [];

        const db = getFirestoreDb();
        const results: PublicProfile[] = [];

        try {
            // Exact friend-code match (format: ACE-1234)
            if (/^[a-z]{3}-\d{4}$/i.test(term)) {
                const snap = await getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('friendCode', '==', term.toUpperCase()),
                ));
                snap.forEach(d => results.push(d.data() as PublicProfile));
                return results;
            }

            // @username prefix search (usernames stored lowercase)
            const end = term + '\uf8ff';
            const snap = await getDocs(fsQuery(
                collection(db, 'profiles'),
                where('username', '>=', term),
                where('username', '<=', end),
                limit(10),
            ));
            snap.forEach(d => results.push(d.data() as PublicProfile));

            // Fall back to displayName prefix if no username results
            if (results.length === 0) {
                const nameSnap = await getDocs(fsQuery(
                    collection(db, 'profiles'),
                    where('displayName', '>=', rawQuery.trim()),
                    where('displayName', '<=', rawQuery.trim() + '\uf8ff'),
                    limit(10),
                ));
                nameSnap.forEach(d => results.push(d.data() as PublicProfile));
            }
        } catch {
            // Firestore unavailable or rules error.
        }

        return results;
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
