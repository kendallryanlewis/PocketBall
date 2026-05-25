import { Injectable } from '@angular/core';
import { GameType } from '../models/round.model';

export interface GolfClub {
    id: string;
    name: string;
    shortName: string;
    type: 'wood' | 'iron' | 'wedge' | 'putter' | 'hybrid';
}

export const GOLF_CLUBS: GolfClub[] = [
    { id: 'driver', name: 'Driver', shortName: '1W', type: 'wood' },
    { id: '3w', name: '3-Wood', shortName: '3W', type: 'wood' },
    { id: '5w', name: '5-Wood', shortName: '5W', type: 'wood' },
    { id: '3h', name: '3-Hybrid', shortName: '3H', type: 'hybrid' },
    { id: '4h', name: '4-Hybrid', shortName: '4H', type: 'hybrid' },
    { id: '3i', name: '3-Iron', shortName: '3I', type: 'iron' },
    { id: '4i', name: '4-Iron', shortName: '4I', type: 'iron' },
    { id: '5i', name: '5-Iron', shortName: '5I', type: 'iron' },
    { id: '6i', name: '6-Iron', shortName: '6I', type: 'iron' },
    { id: '7i', name: '7-Iron', shortName: '7I', type: 'iron' },
    { id: '8i', name: '8-Iron', shortName: '8I', type: 'iron' },
    { id: '9i', name: '9-Iron', shortName: '9I', type: 'iron' },
    { id: 'pw', name: 'Pitching Wedge', shortName: 'PW', type: 'wedge' },
    { id: 'gw', name: 'Gap Wedge', shortName: 'GW', type: 'wedge' },
    { id: 'sw', name: 'Sand Wedge', shortName: 'SW', type: 'wedge' },
    { id: 'lw', name: 'Lob Wedge', shortName: 'LW', type: 'wedge' },
    { id: 'putter', name: 'Putter', shortName: 'PT', type: 'putter' },
];

/** Clubs eligible for random selection (everything except the putter). */
const DRAWABLE = GOLF_CLUBS.filter(c => c.type !== 'putter');

/** Clubs for Iron Man — irons + putter only (no woods, no hybrids, no wedges). */
const IRON_MAN_CLUBS = GOLF_CLUBS.filter(c => c.type === 'iron' || c.type === 'putter');

@Injectable({ providedIn: 'root' })
export class ClubRandomizerService {

    /** Shuffle an array using Fisher–Yates. */
    private shuffle<T>(arr: T[]): T[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** Pick `n` clubs at random from `pool`, then always append the putter. */
    private draw(pool: GolfClub[], n: number): string[] {
        const picked = this.shuffle(pool).slice(0, n);
        return [...picked.map(c => c.name), 'Putter'];
    }

    /**
     * Build a per-player club draw for game types that assign clubs per player.
     * Returns a Record<playerId, string[]>.
     */
    drawPerPlayer(
        gameType: GameType,
        playerIds: string[],
    ): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        for (const pid of playerIds) {
            result[pid] = this.drawForPlayer(gameType);
        }
        return result;
    }

    /** Return the club list for a single player given the game type. */
    drawForPlayer(gameType: GameType): string[] {
        switch (gameType) {
            case 'one_club':
                return this.draw(DRAWABLE, 1);
            case 'three_club_challenge':
                return this.draw(DRAWABLE, 3);
            case 'random_bag':
                return this.draw(DRAWABLE, 7);
            case 'iron_man':
                return IRON_MAN_CLUBS.map(c => c.name);
            default:
                return [];
        }
    }

    /**
     * Build a per-hole club draw for `club_of_the_hole`.
     * Returns an array of club names, one per hole.
     */
    drawPerHole(holeCount: number): string[] {
        // Exclude the putter — it's always allowed on the green
        const pool = this.shuffle(DRAWABLE);
        return Array.from({ length: holeCount }, (_, i) => pool[i % pool.length].name);
    }

    /** Whether this game type requires a club draw before the round starts. */
    requiresClubDraw(gameType: GameType): boolean {
        return ['one_club', 'three_club_challenge', 'iron_man', 'random_bag', 'club_of_the_hole'].includes(gameType);
    }

    /** Whether the draw is per-player (vs per-hole). */
    isPerPlayerDraw(gameType: GameType): boolean {
        return ['one_club', 'three_club_challenge', 'iron_man', 'random_bag'].includes(gameType);
    }

    /** Get a club by its ID. */
    getClub(id: string): GolfClub | undefined {
        return GOLF_CLUBS.find(c => c.id === id);
    }
}
