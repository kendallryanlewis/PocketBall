import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { CoursesService } from '../../services/courses.service';
import { Round, roundTotal, GAME_TYPES, HoleScore } from '../../models/round.model';
import { Course } from '../../models/course.model';
import { Player } from '../../models/player.model';
import { ReplacePipe } from '../../pipes/pipes';

export interface PlayerStat {
    player: Player;
    total: number;
    toPar: number;
    gir: number;         // %
    fairways: number;    // %
    avgPutts: number;
    penalties: number;
    breakdown: { ace: number; eagle: number; birdie: number; par: number; bogey: number; double: number; triple: number };
    bestHole: { idx: number; toPar: number } | null;
}

@Component({
    selector: 'app-round-summary',
    imports: [RouterLink, DatePipe, ReplacePipe],
    templateUrl: './round-summary.component.html',
    styleUrl: './round-summary.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundSummaryComponent implements OnInit {
    private route = inject(ActivatedRoute);
    protected router = inject(Router);
    private roundsService = inject(RoundsService);
    private playersService = inject(PlayersService);
    private coursesService = inject(CoursesService);

    round = signal<Round | null>(null);
    course = signal<Course | null>(null);
    players = signal<Player[]>([]);

    gameMeta = computed(() => {
        const r = this.round();
        return r ? GAME_TYPES.find(g => g.id === r.gameType) : null;
    });

    parTotal = computed(() => {
        const c = this.course();
        const r = this.round();
        if (!c) return r ? r.holes * 4 : 72;
        return c.holes.slice(0, r?.holes ?? 18).reduce((s, h) => s + h.par, 0);
    });

    holePars = computed(() => {
        const c = this.course();
        const r = this.round();
        const count = r?.holes ?? 18;
        if (!c) return Array(count).fill(4) as number[];
        return c.holes.slice(0, count).map(h => h.par);
    });

    holeNumbers = computed(() => {
        const r = this.round();
        return r ? Array.from({ length: r.holes }, (_, i) => i) : [];
    });

    /** Leaderboard: sorted by total score ascending, DNF (no strokes) last */
    leaderboard = computed((): PlayerStat[] => {
        const r = this.round();
        const ps = this.players();
        const pars = this.holePars();
        if (!r) return [];

        const stats: PlayerStat[] = r.playerRounds.map(pr => {
            const player = ps.find(p => p.id === pr.playerId) ?? {
                id: pr.playerId, name: 'Unknown', initials: '?', color: '#888',
            } as Player;

            const total = roundTotal(pr);
            const toPar = total - this.parTotal();

            // GIR %
            const girHoles = pr.scores.filter(s => s.gir === true).length;
            const scoredHoles = pr.scores.filter(s => (s.strokes ?? null) !== null).length;
            const gir = scoredHoles ? Math.round((girHoles / scoredHoles) * 100) : 0;

            // Fairways % (par 4+5 holes only)
            const fwHoles = pars.reduce((acc, par, i) => {
                const s = pr.scores[i];
                if (par >= 4 && (s?.strokes ?? null) !== null) acc.push(s);
                return acc;
            }, [] as HoleScore[]);
            const fwHit = fwHoles.filter(s => s.fairwayHit === true).length;
            const fairways = fwHoles.length ? Math.round((fwHit / fwHoles.length) * 100) : 0;

            // Putts
            const puttScores = pr.scores.filter(s => (s.putts ?? null) !== null);
            const avgPutts = puttScores.length
                ? +(puttScores.reduce((a, s) => a + (s.putts ?? 0), 0) / puttScores.length).toFixed(1)
                : 0;

            // Penalties
            const penalties = pr.scores.reduce((a, s) => a + (s.penalties ?? 0), 0);

            // Score breakdown
            const breakdown = { ace: 0, eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, triple: 0 };
            pr.scores.forEach((s, i) => {
                if ((s.strokes ?? null) === null) return;
                const diff = (s.strokes as number) - (pars[i] ?? 4);
                if (s.strokes === 1) breakdown.ace++;
                else if (diff <= -2) breakdown.eagle++;
                else if (diff === -1) breakdown.birdie++;
                else if (diff === 0) breakdown.par++;
                else if (diff === 1) breakdown.bogey++;
                else if (diff === 2) breakdown.double++;
                else breakdown.triple++;
            });

            // Best hole
            let bestHole: { idx: number; toPar: number } | null = null;
            pr.scores.forEach((s, i) => {
                if ((s.strokes ?? null) === null) return;
                const tp = (s.strokes as number) - (pars[i] ?? 4);
                if (bestHole === null || tp < bestHole.toPar) bestHole = { idx: i, toPar: tp };
            });

            return { player, total, toPar, gir, fairways, avgPutts, penalties, breakdown, bestHole };
        });

        return stats.sort((a, b) => {
            if (a.total === 0) return 1;
            if (b.total === 0) return -1;
            return a.total - b.total;
        });
    });

    winner = computed(() => {
        const r = this.round();
        return r?.winner ? this.playersService.getById(r.winner) : null;
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        const r = this.roundsService.getById(id);
        if (!r) { this.router.navigate(['/app/history']); return; }
        this.round.set(r);
        if (r.courseId) this.course.set(this.coursesService.getById(r.courseId) ?? null);
        const ps = r.playerRounds.map(pr => this.playersService.getById(pr.playerId)).filter(Boolean) as Player[];
        this.players.set(ps);
    }

    // ── Scorecard helpers ────────────────────────────────────────────────────

    getScore(playerId: string, holeIdx: number): number | null {
        const r = this.round();
        return this.roundsService.scoreForHole(r!, playerId, holeIdx);
    }

    scoreBadge(strokes: number | null, par: number): string {
        if (strokes === null) return '';
        const diff = strokes - par;
        if (strokes === 1) return 'ace';
        if (diff <= -2) return 'eagle';
        if (diff === -1) return 'birdie';
        if (diff === 0) return 'par';
        if (diff === 1) return 'bogey';
        if (diff === 2) return 'double';
        return 'triple';
    }

    scoreFront(playerId: string): number {
        const r = this.round();
        const pr = r?.playerRounds.find(p => p.playerId === playerId);
        return pr?.scores.slice(0, 9).reduce((s, h) => s + (h.strokes ?? 0), 0) ?? 0;
    }

    scoreBack(playerId: string): number {
        const r = this.round();
        const pr = r?.playerRounds.find(p => p.playerId === playerId);
        return pr?.scores.slice(9).reduce((s, h) => s + (h.strokes ?? 0), 0) ?? 0;
    }

    toPar(n: number): string {
        if (n === 0) return 'E';
        return n > 0 ? `+${n}` : `${n}`;
    }

    positionLabel(i: number): string {
        return ['1st', '2nd', '3rd'][i] ?? `${i + 1}th`;
    }

    breakdownEntries(bd: PlayerStat['breakdown']): { label: string; count: number; cls: string }[] {
        return [
            { label: 'ACE', count: bd.ace, cls: 'ace' },
            { label: 'Eagle', count: bd.eagle, cls: 'eagle' },
            { label: 'Birdie', count: bd.birdie, cls: 'birdie' },
            { label: 'Par', count: bd.par, cls: 'par' },
            { label: 'Bogey', count: bd.bogey, cls: 'bogey' },
            { label: 'Double', count: bd.double, cls: 'double' },
            { label: 'Triple+', count: bd.triple, cls: 'triple' },
        ].filter(e => e.count > 0);
    }
}
