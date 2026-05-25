import { Injectable } from '@angular/core';
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot,
    deleteDoc,
    Firestore,
    serverTimestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { Round } from '../models/round.model';
import { getFirebaseApp } from '../firebase.config';

/** Firestore collection that holds in-progress live rounds */
const COLLECTION = 'liveRounds';

@Injectable({ providedIn: 'root' })
export class RoundSyncService {
    private db: Firestore | null = null;
    private unsubs = new Map<string, Unsubscribe>();

    constructor() {
        try {
            const app = getFirebaseApp();
            this.db = getFirestore(app);
        } catch (e) {
            console.warn('[RoundSync] Firebase init failed — live sync disabled:', e);
        }
    }

    get available(): boolean {
        return this.db !== null;
    }

    /** Push the full round state to Firestore. */
    async publish(round: Round): Promise<void> {
        if (!this.db) return;
        try {
            const ref = doc(this.db, COLLECTION, round.id);
            // Firestore can't store `undefined` values — strip them before writing
            const payload = JSON.parse(JSON.stringify({ ...round, _syncedAt: serverTimestamp() }));
            await setDoc(ref, payload);
        } catch (e) {
            console.warn('[RoundSync] publish failed:', e);
        }
    }

    /**
     * Listen for live updates to a round.
     * `onUpdate` is called every time another device pushes a change.
     * Call `unsubscribe(roundId)` to detach the listener.
     */
    subscribe(roundId: string, onUpdate: (round: Round) => void): void {
        if (!this.db) return;
        this.unsubscribe(roundId); // detach any stale listener first

        const ref = doc(this.db, COLLECTION, roundId);
        const unsub: Unsubscribe = onSnapshot(
            ref,
            snap => {
                if (!snap.exists()) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = snap.data() as any;
                // Remove server-only fields before handing back to app
                delete data['_syncedAt'];
                onUpdate(data as Round);
            },
            err => console.warn('[RoundSync] snapshot error:', err),
        );

        this.unsubs.set(roundId, unsub);
    }

    /** Detach the Firestore listener for `roundId` (does not delete the doc). */
    unsubscribe(roundId: string): void {
        this.unsubs.get(roundId)?.();
        this.unsubs.delete(roundId);
    }

    /** Remove the live round document from Firestore (call on round complete). */
    async unpublish(roundId: string): Promise<void> {
        this.unsubscribe(roundId);
        if (!this.db) return;
        try {
            await deleteDoc(doc(this.db, COLLECTION, roundId));
        } catch (e) {
            console.warn('[RoundSync] unpublish failed:', e);
        }
    }
}
