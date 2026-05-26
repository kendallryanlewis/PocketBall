import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Round, newRound, roundTotal, GameType, HoleScore } from '../models/round.model';
import { getFirestoreDb } from '../firebase.config';

const KEY = 'cg_rounds';

@Injectable({ providedIn: 'root' })
export class RoundsService {
    private storage = inject(StorageService);
    private auth = inject(AuthService);
    private _rounds = signal<Round[]>(this.storage.get<Round[]>(KEY, []));

    readonly rounds = this._rounds.asReadonly();
    readonly active = computed(() => this._rounds().find(r => !r.completed));
    readonly history = computed(() =>
        this._rounds().filter(r => r.completed).sort((a, b) => b.date - a.date)
    );

    constructor() {
        effect(() => {
            const userId = this.auth.user()?.userId;
            if (userId) this.syncFromFirestore(userId);
        });
    }

    private async syncFromFirestore(userId: string): Promise<void> {
        try {
            const db = getFirestoreDb();
            const snap = await getDocs(collection(db, 'users', userId, 'rounds'));
            if (!snap.empty) {
                const rounds = snap.docs.map(d => d.data() as Round)
                    .sort((a, b) => b.date - a.date);
                this._rounds.set(rounds);
                this.storage.set(KEY, rounds);
            } else {
                for (const r of this._rounds()) {
                    setDoc(doc(db, 'users', userId, 'rounds', r.id), r).catch(() => {});
                }
            }
        } catch {
            // Offline — localStorage data is already loaded.
        }
    }

    private fsWrite(round: Round): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        setDoc(doc(getFirestoreDb(), 'users', userId, 'rounds', round.id), round)
            .catch(() => {});
    }

    private fsDelete(id: string): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        deleteDoc(doc(getFirestoreDb(), 'users', userId, 'rounds', id))
            .catch(() => {});
    }

    getById(id: string): Round | undefined {
        return this._rounds().find(r => r.id === id);
    }

    create(opts: Parameters<typeof newRound>[0]): Round {
        const round = newRound(opts);
        const updated = [round, ...this._rounds()];
        this._rounds.set(updated);
        this.storage.set(KEY, updated);
        this.fsWrite(round);
        return round;
    }

    update(round: Round): void {
        const updated = this._rounds().map(r => r.id === round.id ? round : r);
        this._rounds.set(updated);
        this.storage.set(KEY, updated);
        this.fsWrite(round);
    }

    complete(id: string, winner?: string): void {
        const round = this.getById(id);
        if (!round) return;
        this.update({ ...round, completed: true, winner });
    }

    delete(id: string): void {
        const updated = this._rounds().filter(r => r.id !== id);
        this._rounds.set(updated);
        this.storage.set(KEY, updated);
        this.fsDelete(id);
    }

    scoreForHole(round: Round, playerId: string, holeIdx: number): number | null {
        const pr = round.playerRounds.find(p => p.playerId === playerId);
        return pr?.scores[holeIdx]?.strokes ?? null;
    }

    setScore(round: Round, playerId: string, holeIdx: number, strokes: number | null): Round {
        const playerRounds = round.playerRounds.map(pr => {
            if (pr.playerId !== playerId) return pr;
            const scores = [...pr.scores];
            scores[holeIdx] = { ...scores[holeIdx], strokes };
            return { ...pr, scores };
        });
        return { ...round, playerRounds };
    }

    /** Replace the entire HoleScore for a player/hole in one call. */
    setHoleScore(round: Round, playerId: string, holeIdx: number, score: HoleScore): Round {
        const playerRounds = round.playerRounds.map(pr => {
            if (pr.playerId !== playerId) return pr;
            const scores = [...pr.scores];
            scores[holeIdx] = { ...score };
            return { ...pr, scores };
        });
        return { ...round, playerRounds };
    }

    setHoleStats(
        round: Round,
        playerId: string,
        holeIdx: number,
        patch: Partial<{ strokes: number | null; putts: number | null; fairwayHit: boolean | null; gir: boolean | null }>
    ): Round {
        const playerRounds = round.playerRounds.map(pr => {
            if (pr.playerId !== playerId) return pr;
            const scores = [...pr.scores];
            scores[holeIdx] = { ...scores[holeIdx], ...patch };
            return { ...pr, scores };
        });
        return { ...round, playerRounds };
    }

    getHoleScore(round: Round, playerId: string, holeIdx: number): { strokes: number | null; putts: number | null; fairwayHit: boolean | null; gir: boolean | null } {
        const pr = round.playerRounds.find(p => p.playerId === playerId);
        const s = pr?.scores[holeIdx];
        return {
            strokes: s?.strokes ?? null,
            putts: s?.putts ?? null,
            fairwayHit: s?.fairwayHit ?? null,
            gir: s?.gir ?? null,
        };
    }

    /** Stats helpers */
    bestRound(playerId: string): number | null {
        const totals = this._rounds()
            .filter(r => r.completed && r.playerRounds.some(pr => pr.playerId === playerId))
            .map(r => {
                const pr = r.playerRounds.find(p => p.playerId === playerId)!;
                return roundTotal(pr);
            })
            .filter(t => t > 0);
        return totals.length ? Math.min(...totals) : null;
    }

    avgScore(playerId: string): number | null {
        const totals = this._rounds()
            .filter(r => r.completed && r.playerRounds.some(pr => pr.playerId === playerId))
            .map(r => {
                const pr = r.playerRounds.find(p => p.playerId === playerId)!;
                return roundTotal(pr);
            })
            .filter(t => t > 0);
        return totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : null;
    }

    wins(playerId: string): number {
        return this._rounds().filter(r => r.completed && r.winner === playerId).length;
    }
}
