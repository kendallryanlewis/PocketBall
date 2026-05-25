import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy, effect } from '@angular/core';
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
import { RoundSyncService } from '../../services/round-sync.service';
import { NavService } from '../../services/nav.service';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-round-view',
    imports: [ReplacePipe, TitleCasePipe, QrModalComponent, ScoreEntryComponent],
    templateUrl: './round-view.component.html',
    styleUrl: './round-view.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundViewComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    protected router = inject(Router);
    private roundsService = inject(RoundsService);
    protected playersService = inject(PlayersService);
    private coursesService = inject(CoursesService);
    private bridge = inject(BridgeService);
    private analytics = inject(AnalyticsService);
    private qrSvc = inject(QrService);
    private syncSvc = inject(RoundSyncService);
    private navSvc = inject(NavService);

    round = signal<Round | null>(null);
    course = signal<Course | null>(null);
    players = signal<Player[]>([]);

    activeHoleIdx = signal(0);
    showComplete = signal(false);
    showMenu = signal(false);

    /** Active score entry context — null when sheet is closed. */
    scoreEntryCtx = signal<ScoreEntryContext | null>(null);

    /** Live sync state */
    liveStatus = signal<'off' | 'connecting' | 'live' | 'error'>('off');
    /** True when we originated the live session (we are the host/pusher) */
    private isLiveHost = false;
    /** Timestamp of the last remote update we applied (to debounce self-updates) */
    private lastPublishTime = 0;

    constructor() {
        // Hide the bottom nav whenever any full-screen overlay is open
        effect(() => {
            const anyOpen = !!this.scoreEntryCtx() || this.showComplete() || this.showRoundQr();
            anyOpen ? this.navSvc.hide() : this.navSvc.show();
        });
    }

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

    /** Live game-specific info for the active hole. Drives the banner below the hole strip. */
    gameBanner = computed((): { lines: { label: string; value: string }[]; icon: string } | null => {
        const r = this.round();
        const ps = this.players();
        const holeIdx = this.activeHoleIdx();
        if (!r || !ps.length) return null;

        switch (r.gameType) {

            case 'wolf': {
                const wolfIdx = holeIdx % ps.length;
                const wolf = ps[wolfIdx];
                const nextWolf = ps[(holeIdx + 1) % ps.length];
                return {
                    icon: '🐺',
                    lines: [
                        { label: 'Wolf this hole', value: wolf?.name ?? '—' },
                        { label: 'Next wolf', value: nextWolf?.name ?? '—' },
                        { label: 'Rule', value: 'Wolf picks partner after each tee shot, or goes Lone Wolf for 2×' },
                    ],
                };
            }

            case 'club_of_the_hole': {
                const club = r.clubDraw?.perHole?.[holeIdx];
                if (!club) return null;
                return {
                    icon: '🃏',
                    lines: [
                        { label: 'Club this hole', value: club },
                        { label: 'Note', value: 'Putter allowed on the green' },
                    ],
                };
            }

            case 'one_club':
            case 'three_club_challenge':
            case 'random_bag': {
                const perPlayer = r.clubDraw?.perPlayer;
                if (!perPlayer) return null;
                return {
                    icon: '🎲',
                    lines: ps.map(p => ({
                        label: p.name,
                        value: (perPlayer[p.id] ?? []).join(' · ') || '—',
                    })),
                };
            }

            case 'skins': {
                // Count consecutive tied holes (carried skins)
                let carried = 0;
                for (let i = holeIdx - 1; i >= 0; i--) {
                    const scores = ps.map(p => r.playerRounds.find(pr => pr.playerId === p.id)?.scores[i]?.strokes ?? null);
                    const valid = scores.filter(s => s !== null) as number[];
                    if (valid.length < 2) break;
                    const min = Math.min(...valid);
                    if (valid.filter(s => s === min).length > 1) { carried++; } else { break; }
                }
                const pot = carried + 1;
                return {
                    icon: '💰',
                    lines: [
                        { label: 'Skin value', value: `${pot} skin${pot > 1 ? 's' : ''} (${carried} carried)` },
                        { label: 'Rule', value: 'Lowest unique score wins; ties carry to next hole' },
                    ],
                };
            }

            case 'nassau': {
                const front = ps.map(p => ({
                    name: p.name,
                    score: r.playerRounds.find(pr => pr.playerId === p.id)?.scores.slice(0, 9).reduce((s, h) => s + (h.strokes ?? 0), 0) ?? 0,
                })).sort((a, b) => a.score - b.score);
                const back = ps.map(p => ({
                    name: p.name,
                    score: r.playerRounds.find(pr => pr.playerId === p.id)?.scores.slice(9, 18).reduce((s, h) => s + (h.strokes ?? 0), 0) ?? 0,
                })).sort((a, b) => a.score - b.score);
                return {
                    icon: '🏦',
                    lines: [
                        { label: 'Front 9 leader', value: front[0]?.score ? front[0].name : 'Tied' },
                        { label: 'Back 9 leader', value: back[0]?.score ? back[0].name : 'Tied' },
                        { label: 'Rule', value: '3 bets: front 9, back 9, overall' },
                    ],
                };
            }

            case 'snake': {
                // Snake holder = last player to 3-putt
                let holder: string | null = null;
                for (let i = holeIdx - 1; i >= 0; i--) {
                    for (const p of ps) {
                        const h = r.playerRounds.find(pr => pr.playerId === p.id)?.scores[i];
                        if (h && (h.putts ?? 0) >= 3) { holder = p.name; break; }
                    }
                    if (holder) break;
                }
                return {
                    icon: '🐍',
                    lines: [
                        { label: 'Snake holder', value: holder ?? 'No one yet' },
                        { label: 'Rule', value: '3-putt = you hold the snake. Carry it to the end and you pay' },
                    ],
                };
            }

            case 'bingo_bango_bongo':
                return {
                    icon: '🎰',
                    lines: [
                        { label: 'Bingo', value: 'First ball on the green' },
                        { label: 'Bango', value: 'Closest to pin when all on green' },
                        { label: 'Bongo', value: 'First ball in the hole' },
                    ],
                };

            case 'nines':
                return {
                    icon: '9️⃣',
                    lines: [
                        { label: 'Points this hole', value: '9 total (5-3-1 or 4-3-2)' },
                        { label: 'Rule', value: 'Best score gets 5, second gets 3, third gets 1' },
                    ],
                };

            case 'match_play': {
                if (ps.length < 2) return null;
                const p1 = ps[0]; const p2 = ps[1];
                const p1Holes = r.playerRounds.find(pr => pr.playerId === p1.id)?.scores ?? [];
                const p2Holes = r.playerRounds.find(pr => pr.playerId === p2.id)?.scores ?? [];
                let status = 0; // positive = p1 up
                for (let i = 0; i < holeIdx; i++) {
                    const s1 = p1Holes[i]?.strokes ?? null;
                    const s2 = p2Holes[i]?.strokes ?? null;
                    if (s1 !== null && s2 !== null) {
                        if (s1 < s2) status++;
                        else if (s2 < s1) status--;
                    }
                }
                const label = status === 0 ? 'All Square'
                    : status > 0 ? `${p1.name} ${status} UP` : `${p2.name} ${Math.abs(status)} UP`;
                return {
                    icon: '⚔️',
                    lines: [{ label: 'Match status', value: label }],
                };
            }

            case 'stableford': {
                const pts = ps.map(p => {
                    const pr = r.playerRounds.find(x => x.playerId === p.id);
                    const points = (pr?.scores ?? []).slice(0, holeIdx).reduce((sum, h, i) => {
                        if (h.strokes === null) return sum;
                        const par = 4; // approximation without course data
                        const diff = h.strokes - par;
                        if (diff <= -2) return sum + 4;
                        if (diff === -1) return sum + 3;
                        if (diff === 0) return sum + 2;
                        if (diff === 1) return sum + 1;
                        return sum;
                    }, 0);
                    return { name: p.name, points };
                }).sort((a, b) => b.points - a.points);
                return {
                    icon: '🎯',
                    lines: pts.map(p => ({ label: p.name, value: `${p.points} pts` })),
                };
            }

            case 'chairman': {
                return {
                    icon: '👑',
                    lines: [
                        { label: 'Rule', value: 'Lose a hole = eliminated. Last player standing wins' },
                        { label: 'Active', value: ps.map(p => p.name).join(', ') },
                    ],
                };
            }

            default:
                return null;
        }
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
        // Re-attach listener if this round had live sync enabled
        if (r.liveSync) this.attachLiveListener(r.id);
    }

    ngOnDestroy(): void {
        const r = this.round();
        if (r) this.syncSvc.unsubscribe(r.id);
        this.navSvc.show();
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
        // Push update to all connected devices
        if (updated.liveSync) {
            this.lastPublishTime = Date.now();
            this.syncSvc.publish(updated);
        }
    }

    // ── Live sync ──────────────────────────────────────────────────────────

    toggleLiveSync(): void {
        const r = this.round();
        if (!r) return;
        if (r.liveSync) {
            // Turn off
            this.syncSvc.unpublish(r.id);
            const updated = { ...r, liveSync: false };
            this.round.set(updated);
            this.roundsService.update(updated);
            this.liveStatus.set('off');
            this.isLiveHost = false;
        } else {
            // Turn on
            this.liveStatus.set('connecting');
            this.isLiveHost = true;
            const updated = { ...r, liveSync: true };
            this.round.set(updated);
            this.roundsService.update(updated);
            this.syncSvc.publish(updated).then(() => {
                this.attachLiveListener(updated.id);
            });
        }
    }

    private attachLiveListener(roundId: string): void {
        this.syncSvc.subscribe(roundId, incoming => {
            // Ignore echoes of our own publish
            if (Date.now() - this.lastPublishTime < 1500) return;
            this.applyRemoteUpdate(incoming);
        });
        this.liveStatus.set('live');
    }

    private applyRemoteUpdate(incoming: Round): void {
        const current = this.round();
        if (!current || incoming.id !== current.id) return;
        // Don't clobber a score the user is actively entering
        if (this.scoreEntryCtx()) return;
        // Merge: keep the highest-detail score for each player/hole
        const merged: Round = {
            ...current,
            playerRounds: current.playerRounds.map(pr => {
                const inPr = incoming.playerRounds.find(p => p.playerId === pr.playerId);
                if (!inPr) return pr;
                const scores = pr.scores.map((local, i) => {
                    const remote = inPr.scores[i];
                    if (!remote) return local;
                    // Prefer remote if it has strokes and local doesn't
                    if ((local.strokes ?? null) === null && (remote.strokes ?? null) !== null) return remote;
                    return local;
                });
                return { ...pr, scores };
            }),
        };
        this.round.set(merged);
        this.roundsService.update(merged);
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
        // Remove live round from Firestore
        if (r.liveSync) this.syncSvc.unpublish(r.id);
        this.showComplete.set(false);
        this.router.navigate(['/app/rounds', r.id, 'summary']);
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
