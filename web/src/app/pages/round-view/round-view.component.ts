import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { CoursesService } from '../../services/courses.service';
import { Round, roundTotal, GAME_TYPES, HoleScore } from '../../models/round.model';
import { Course } from '../../models/course.model';
import { Player } from '../../models/player.model';
import { BridgeService } from '../../services/bridge.service';
import { AnalyticsService } from '../../services/analytics.service';
import { QrService } from '../../services/qr.service';
import { QrModalComponent } from '../../components/qr-modal/qr-modal.component';
import { ScoreEntryComponent, ScoreEntryContext } from '../../components/score-entry/score-entry.component';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-round-view',
    imports: [ReplacePipe, TitleCasePipe, QrModalComponent, ScoreEntryComponent],
    templateUrl: './round-view.component.html',
    styleUrl: './round-view.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundViewComponent implements OnInit {
    private route = inject(ActivatedRoute);
    protected router = inject(Router);
    private roundsService = inject(RoundsService);
    protected playersService = inject(PlayersService);
    private coursesService = inject(CoursesService);
    private bridge = inject(BridgeService);
    private analytics = inject(AnalyticsService);
    private qrSvc = inject(QrService);

    round = signal<Round | null>(null);
    course = signal<Course | null>(null);
    players = signal<Player[]>([]);

    activeHoleIdx = signal(0);
    showComplete = signal(false);
    showMenu = signal(false);

    /** Active score entry context — null when sheet is closed. */
    scoreEntryCtx = signal<ScoreEntryContext | null>(null);

    showRoundQr = signal(false);
    roundQrValue = computed(() => {
        const r = this.round();
        const me = this.players()[0];
        if (!r) return '';
        return this.qrSvc.roundQrValue(r, me?.name ?? 'Host');
    });

    gameMeta = computed(() => {
        const r = this.round();
        return r ? GAME_TYPES.find(g => g.id === r.gameType) : null;
    });

    scoreTotals = computed(() => {
        const r = this.round();
        if (!r) return {};
        return Object.fromEntries(r.playerRounds.map(pr => [pr.playerId, roundTotal(pr)]));
    });

    scoreFront = computed(() => {
        const r = this.round();
        if (!r) return {};
        return Object.fromEntries(r.playerRounds.map(pr => [
            pr.playerId,
            pr.scores.slice(0, 9).reduce((s, h) => s + (h.strokes ?? 0), 0)
        ]));
    });

    scoreBack = computed(() => {
        const r = this.round();
        if (!r) return {};
        return Object.fromEntries(r.playerRounds.map(pr => [
            pr.playerId,
            pr.scores.slice(9).reduce((s, h) => s + (h.strokes ?? 0), 0)
        ]));
    });

    parTotal = computed(() => {
        const c = this.course();
        return c ? c.holes.reduce((s, h) => s + h.par, 0) : 72;
    });

    holeNumbers = computed(() => {
        const r = this.round();
        return r ? Array.from({ length: r.holes }, (_, i) => i) : [];
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        const r = this.roundsService.getById(id);
        if (!r) { this.router.navigate(['/app/history']); return; }
        this.round.set(r);
        this.activeHoleIdx.set(r.currentHole - 1);
        if (r.courseId) this.course.set(this.coursesService.getById(r.courseId) ?? null);
        const ps = r.playerRounds.map(pr => this.playersService.getById(pr.playerId)).filter(Boolean) as Player[];
        this.players.set(ps);
    }

    getScore(playerId: string, holeIdx: number): number | null {
        const r = this.round();
        if (!r) return null;
        return this.roundsService.scoreForHole(r, playerId, holeIdx);
    }

    getHoleScore(playerId: string, holeIdx: number): HoleScore | undefined {
        const r = this.round();
        return r?.playerRounds.find(p => p.playerId === playerId)?.scores[holeIdx];
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

    openScoreEntry(playerId: string, holeIdx: number): void {
        if (this.round()?.completed) return;
        this.activeHoleIdx.set(holeIdx);
        const player = this.players().find(p => p.id === playerId);
        if (!player) return;
        const c = this.course();
        const hole = c?.holes[holeIdx];
        const existing = this.getHoleScore(playerId, holeIdx);
        // Pass club restrictions for challenge game types
        const r = this.round();
        const availableClubs = r?.clubDraw?.type === 'per_player'
            ? r.clubDraw.perPlayer?.[playerId]
            : r?.clubDraw?.type === 'per_hole'
                ? (r.clubDraw.perHole?.[holeIdx] ? [r.clubDraw.perHole[holeIdx]] : undefined)
                : undefined;

        this.scoreEntryCtx.set({
            player,
            holeIndex: holeIdx,
            par: hole?.par ?? 4,
            holeYardage: hole?.tees?.[0]?.yards,
            existing,
            availableClubs,
        });
    }

    onScoreSaved(score: HoleScore): void {
        const ctx = this.scoreEntryCtx();
        const r = this.round();
        if (!ctx || !r) return;
        const updated = this.roundsService.setHoleScore(r, ctx.player.id, ctx.holeIndex, score);
        this.round.set(updated);
        this.roundsService.update(updated);
        this.scoreEntryCtx.set(null);
    }

    scrollToHole(idx: number): void {
        this.activeHoleIdx.set(idx);
        const r = this.round();
        if (r) {
            const updated = { ...r, currentHole: idx + 1 };
            this.round.set(updated);
            this.roundsService.update(updated);
        }
    }

    completeRound(): void {
        const r = this.round();
        if (!r) return;
        const winner = this.determineWinner();
        this.roundsService.complete(r.id, winner ?? undefined);
        if (winner) this.playersService.incrementWins(winner);
        this.playersService.incrementRounds(r.playerRounds.map(p => p.playerId));
        this.analytics.track('round_complete', {
            game_type: r.gameType,
            hole_count: r.playerRounds[0]?.scores.length ?? 0,
            player_count: r.playerRounds.length,
        });
        this.showComplete.set(false);
        this.router.navigate(['/app/history']);
    }

    private determineWinner(): string | null {
        const r = this.round();
        if (!r) return null;
        let best: string | null = null;
        let bestScore = Infinity;
        for (const pr of r.playerRounds) {
            const total = roundTotal(pr);
            if (total > 0 && total < bestScore) { bestScore = total; best = pr.playerId; }
        }
        return best;
    }

    shareScorecard(): void {
        const r = this.round();
        if (!r) return;
        const lines = [`🏌️ ${r.courseName} — ${r.gameType.replace(/_/g, ' ')}`];
        for (const pr of r.playerRounds) {
            const p = this.playersService.getById(pr.playerId);
            lines.push(`${p?.name ?? 'Player'}: ${roundTotal(pr)}`);
        }
        this.bridge.shareText(lines.join('\n'));
    }

    allHolesScored = computed(() => {
        const r = this.round();
        if (!r || r.completed) return false;
        return r.playerRounds.every(pr =>
            Array.from({ length: r.holes }, (_, i) => i)
                .every(i => (pr.scores[i]?.strokes ?? null) !== null)
        );
    });

    nextHole(): void {
        const r = this.round();
        if (!r) return;
        const next = this.activeHoleIdx() + 1;
        if (next < r.holes) this.scrollToHole(next);
    }

    holePar(idx: number): number {
        return this.course()?.holes[idx]?.par ?? 4;
    }
}
