import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Player, Trophy, newPlayer } from '../models/player.model';

const PLAYERS_KEY = 'cg_players';
const TROPHIES_KEY = 'cg_trophies';

@Injectable({ providedIn: 'root' })
export class PlayersService {
    private storage = inject(StorageService);
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
    }

    addTrophy(trophy: Trophy): void {
        const updated = [trophy, ...this._trophies()];
        this._trophies.set(updated);
        this.storage.set(TROPHIES_KEY, updated);
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
