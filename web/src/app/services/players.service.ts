import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Player, Trophy, newPlayer } from '../models/player.model';
import { getFirestoreDb } from '../firebase.config';

const PLAYERS_KEY = 'cg_players';
const TROPHIES_KEY = 'cg_trophies';

@Injectable({ providedIn: 'root' })
export class PlayersService {
    private storage = inject(StorageService);
    private auth = inject(AuthService);
    private _players = signal<Player[]>(this.storage.get<Player[]>(PLAYERS_KEY, []));
    private _trophies = signal<Trophy[]>(this.storage.get<Trophy[]>(TROPHIES_KEY, []));

    readonly players = this._players.asReadonly();
    readonly trophies = this._trophies.asReadonly();
    readonly me = computed(() => this._players().find(p => p.isMe));
    readonly friends = computed(() => this._players().filter(p => !p.isMe));

    constructor() {
        // Seed "Me" player if none exists
        if (!this._players().some(p => p.isMe)) {
            const me = newPlayer('Me', true);
            this.savePlayer(me);
        }

        // Sync from Firestore when the user logs in.
        effect(() => {
            const userId = this.auth.user()?.userId;
            if (userId) this.syncFromFirestore(userId);
        });

        // Whenever auth user is set (login / signup), sync display name to "Me".
        effect(() => {
            const authUser = this.auth.user();
            const me = this.me();
            if (!authUser || !me) return;
            const authName = authUser.displayName?.trim();
            if (authName && authName !== 'Golfer' && me.name === 'Me') {
                const initials = authName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                this.savePlayer({ ...me, name: authName, initials });
            }
        });
    }

    private async syncFromFirestore(userId: string): Promise<void> {
        try {
            const db = getFirestoreDb();
            const [pSnap, tSnap] = await Promise.all([
                getDocs(collection(db, 'users', userId, 'players')),
                getDocs(collection(db, 'users', userId, 'trophies')),
            ]);

            if (!pSnap.empty) {
                const players = pSnap.docs.map(d => d.data() as Player);
                this._players.set(players);
                this.storage.set(PLAYERS_KEY, players);
            } else {
                for (const p of this._players()) {
                    setDoc(doc(db, 'users', userId, 'players', p.id), p).catch(() => {});
                }
            }

            if (!tSnap.empty) {
                const trophies = tSnap.docs.map(d => d.data() as Trophy);
                this._trophies.set(trophies);
                this.storage.set(TROPHIES_KEY, trophies);
            } else {
                for (const t of this._trophies()) {
                    setDoc(doc(db, 'users', userId, 'trophies', t.id), t).catch(() => {});
                }
            }
        } catch {
            // Offline — localStorage data is already loaded.
        }
    }

    private fsWritePlayer(player: Player): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        setDoc(doc(getFirestoreDb(), 'users', userId, 'players', player.id), player)
            .catch(() => {});
    }

    private fsDeletePlayer(id: string): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        deleteDoc(doc(getFirestoreDb(), 'users', userId, 'players', id))
            .catch(() => {});
    }

    private fsWriteTrophy(trophy: Trophy): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        setDoc(doc(getFirestoreDb(), 'users', userId, 'trophies', trophy.id), trophy)
            .catch(() => {});
    }

    getById(id: string): Player | undefined {
        return this._players().find(p => p.id === id);
    }

    savePlayer(player: Player): void {
        const list = this._players();
        const idx = list.findIndex(p => p.id === player.id);
        const updated = idx >= 0
            ? list.map((p, i) => (i === idx ? player : p))
            : [...list, player];
        this._players.set(updated);
        this.storage.set(PLAYERS_KEY, updated);
        this.fsWritePlayer(player);
    }

    addFriend(name: string, friendCode?: string): Player {
        const p: Player = { ...newPlayer(name), friendCode };
        this.savePlayer(p);
        return p;
    }

    /** Find a friend by their shared friend code (case-insensitive). */
    getByFriendCode(code: string): Player | undefined {
        return this._players().find(
            p => p.friendCode?.toLowerCase() === code.trim().toLowerCase()
        );
    }

    /** Link the "Me" player to a signed-in Apple account. */
    linkAppleAccount(appleId: string, displayName: string, friendCode: string): void {
        const me = this.me();
        if (!me) return;
        this.savePlayer({
            ...me, appleId, name: displayName, friendCode,
            initials: displayName.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
        });
    }

    deletePlayer(id: string): void {
        const updated = this._players().filter(p => p.id !== id);
        this._players.set(updated);
        this.storage.set(PLAYERS_KEY, updated);
        this.fsDeletePlayer(id);
    }

    addTrophy(trophy: Trophy): void {
        const updated = [trophy, ...this._trophies()];
        this._trophies.set(updated);
        this.storage.set(TROPHIES_KEY, updated);
        this.fsWriteTrophy(trophy);
    }

    trophiesFor(playerId: string): Trophy[] {
        return this._trophies().filter(t => t.playerId === playerId);
    }

    incrementWins(playerId: string): void {
        const p = this.getById(playerId);
        if (p) this.savePlayer({ ...p, wins: p.wins + 1 });
    }

    incrementRounds(playerIds: string[]): void {
        playerIds.forEach(id => {
            const p = this.getById(id);
            if (p) this.savePlayer({ ...p, roundsPlayed: p.roundsPlayed + 1 });
        });
    }
}
