import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
    collection, doc, addDoc, updateDoc,
    query, where, onSnapshot,
} from 'firebase/firestore';
import { AuthService } from './auth.service';
import { PlayersService } from './players.service';
import { getFirestoreDb } from '../firebase.config';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    fromDisplayName: string;
    fromFriendCode: string;
    fromPhotoURL?: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class FriendRequestService {
    private auth = inject(AuthService);
    private players = inject(PlayersService);

    /** Incoming pending requests for the current user. */
    readonly incoming = signal<FriendRequest[]>([]);
    readonly pendingCount = computed(() => this.incoming().length);

    private _unsub: (() => void) | null = null;

    constructor() {
        effect(() => {
            const userId = this.auth.user()?.userId;
            if (this._unsub) { this._unsub(); this._unsub = null; }
            if (!userId) { this.incoming.set([]); return; }
            this._listen(userId);
        });
    }

    private _listen(userId: string): void {
        try {
            const db = getFirestoreDb();
            const q = query(
                collection(db, 'friendRequests'),
                where('toUserId', '==', userId),
                where('status', '==', 'pending'),
            );
            this._unsub = onSnapshot(q, snap => {
                const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
                this.incoming.set(reqs);
            }, () => { });
        } catch { }
    }

    /** Send a friend request to another user. */
    async sendRequest(to: { userId: string; displayName: string; friendCode: string; photoURL?: string }): Promise<void> {
        const from = this.auth.user();
        if (!from) throw new Error('Not signed in.');
        const db = getFirestoreDb();
        await addDoc(collection(db, 'friendRequests'), {
            fromUserId: from.userId,
            fromDisplayName: from.displayName,
            fromFriendCode: from.friendCode,
            fromPhotoURL: from.photoURL ?? null,
            toUserId: to.userId,
            status: 'pending',
            createdAt: Date.now(),
        });
    }

    /** Accept an incoming request — adds them to local friends and marks doc accepted. */
    async acceptRequest(req: FriendRequest): Promise<void> {
        const db = getFirestoreDb();
        await updateDoc(doc(db, 'friendRequests', req.id), { status: 'accepted' });
        this.players.addFriend(req.fromDisplayName, req.fromFriendCode);
        this.incoming.set(this.incoming().filter(r => r.id !== req.id));
    }

    /** Decline an incoming request — marks doc declined and removes from UI. */
    async declineRequest(req: FriendRequest): Promise<void> {
        const db = getFirestoreDb();
        await updateDoc(doc(db, 'friendRequests', req.id), { status: 'declined' });
        this.incoming.set(this.incoming().filter(r => r.id !== req.id));
    }
}
