import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { CoursesService } from '../../services/courses.service';
import { Round, roundTotal, GAME_TYPES } from '../../models/round.model';
import { Course } from '../../models/course.model';
import { Player } from '../../models/player.model';
import { BridgeService } from '../../services/bridge.service';
import { AnalyticsService } from '../../services/analytics.service';
import { QrService } from '../../services/qr.service';
import { QrModalComponent } from '../../components/qr-modal/qr-modal.component';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-round-view',
    imports: [ReplacePipe, TitleCasePipe, QrModalComponent],
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
    inputPlayerId = signal<string | null>(null);
    inputValue = signal('');
    showComplete = signal(false);
    showMenu = signal(false);

    showRoundQr = signal(false);
    roundQrValue = computed(() => {
        const r = this.round();
        const me = this.players()[0];
        if (!r) return '';
        return this.qrSvc.roundQrValue(r, me?.name ?? 'Host');
    });

    // Full-screen hole focus mode
    focusPlayerId = signal<string | null>(null);
    focusHoleIdx = signal(0);
    focusStrokes = signal<number | null>(null);
    focusPutts = signal<number | null>(null);
    focusFairway = signal<boolean | null>(null); // null = n/a, true = hit, false = miss
    focusFairwayMiss = signal<'left' | 'right' | null>(null);
    focusGir = signal<boolean | null>(null);

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

    openInput(playerId: string, holeIdx: number): void {
        if (this.round()?.completed) return;
        this.inputPlayerId.set(playerId);
        this.activeHoleIdx.set(holeIdx);
        const s = this.getScore(playerId, holeIdx);
        this.inputValue.set(s !== null ? String(s) : '');
    }

    confirmScore(): void {
        const pid = this.inputPlayerId();
        const r = this.round();
        if (!pid || !r) return;
        const strokes = this.inputValue() ? parseInt(this.inputValue()) : null;
        const updated = this.roundsService.setScore(r, pid, this.activeHoleIdx(), strokes);
        this.round.set(updated);
        this.roundsService.update(updated);
        this.inputPlayerId.set(null);
    }

    clearScore(): void {
        const pid = this.inputPlayerId();
        const r = this.round();
        if (!pid || !r) return;
        const updated = this.roundsService.setScore(r, pid, this.activeHoleIdx(), null);
        this.round.set(updated);
        this.roundsService.update(updated);
        this.inputPlayerId.set(null);
    }

    quickScore(n: number): void {
        this.inputValue.set(String(n));
        const pid = this.inputPlayerId();
        const r = this.round();
        if (!pid || !r) return;
        const updated = this.roundsService.setScore(r, pid, this.activeHoleIdx(), n);
        this.round.set(updated);
        this.roundsService.update(updated);
        this.inputPlayerId.set(null);
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
        if (winner) {
            this.playersService.incrementWins(winner);
        }
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
        if (next < r.holes) {
            this.scrollToHole(next);
        }
    }

    holePar(idx: number): number {
        return this.course()?.holes[idx]?.par ?? 4;
    }

    get quickScores(): number[] {
        const par = this.holePar(this.activeHoleIdx());
        return [1, 2, par - 1, par, par + 1, par + 2, par + 3].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
    }
}
