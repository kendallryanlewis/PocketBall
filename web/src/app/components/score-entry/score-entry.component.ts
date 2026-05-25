import {
    Component, inject, input, output, signal, computed, effect, OnInit, OnDestroy,
    ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HoleScore, StrokeDetail } from '../../models/round.model';
import { GOLF_CLUBS } from '../../services/club-randomizer.service';
import { Player } from '../../models/player.model';
import { NavService } from '../../services/nav.service';

export interface ScoreEntryContext {
    player: Player;
    holeIndex: number;
    par: number;
    holeYardage?: number;
    existing?: HoleScore;
    /** Clubs available in this round (undefined = full bag) */
    availableClubs?: string[];
}

@Component({
    selector: 'app-score-entry',
    imports: [FormsModule],
    templateUrl: './score-entry.component.html',
    styleUrl: './score-entry.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keydown.escape)': 'cancel()',
    },
})
export class ScoreEntryComponent implements OnInit, OnDestroy {
    ctx = input.required<ScoreEntryContext>();
    saved = output<HoleScore>();
    cancelled = output<void>();

    private navSvc = inject(NavService);

    // ── Core ──────────────────────────────────────────────────────────────
    strokes = signal(0);
    putts = signal(0);
    penalties = signal(0);

    // ── Fairway ───────────────────────────────────────────────────────────
    /** null = N/A (par 3), true = hit, false = miss */
    fairwayHit = signal<boolean | null>(null);
    fairwayMiss = signal<'left' | 'right' | null>(null);

    // ── GIR ───────────────────────────────────────────────────────────────
    gir = signal<boolean | null>(null);

    // ── Stroke-by-stroke detail ───────────────────────────────────────────
    showDetails = signal(false);
    strokeDetails = signal<StrokeDetail[]>([]);
    clubPickerIdx = signal<number | null>(null);

    // ── Derived ───────────────────────────────────────────────────────────
    scoreDiff = computed(() => this.strokes() - this.ctx().par);
    scoreName = computed(() => {
        const s = this.strokes();
        const diff = this.scoreDiff();
        if (s === 0) return '';
        if (s === 1) return 'Hole in One!';
        if (diff <= -2) return 'Eagle';
        if (diff === -1) return 'Birdie';
        if (diff === 0) return 'Par';
        if (diff === 1) return 'Bogey';
        if (diff === 2) return 'Double';
        if (diff === 3) return 'Triple';
        return `+${diff}`;
    });
    scoreClass = computed(() => {
        const diff = this.scoreDiff();
        const s = this.strokes();
        if (s === 0) return '';
        if (s === 1) return 'ace';
        if (diff <= -2) return 'eagle';
        if (diff === -1) return 'birdie';
        if (diff === 0) return 'par';
        if (diff === 1) return 'bogey';
        if (diff === 2) return 'double';
        return 'triple';
    });

    clubList = computed(() => {
        const available = this.ctx().availableClubs;
        if (available?.length) return available;
        return GOLF_CLUBS.map(c => c.name);
    });

    ngOnInit(): void {
        this.navSvc.hide();
        const c = this.ctx();
        const e = c.existing;

        this.strokes.set(e?.strokes ?? 0);
        this.putts.set(e?.putts ?? 0);
        this.penalties.set(e?.penalties ?? 0);
        this.gir.set(e?.gir ?? null);

        // Fairway — only applicable for par 4+ tee shots
        if (c.par >= 4) {
            this.fairwayHit.set(e?.fairwayHit ?? null);
            this.fairwayMiss.set(e?.fairwayMiss ?? null);
        } else {
            this.fairwayHit.set(null); // par 3: N/A
        }

        // Sync stroke details with stroke count
        const details = e?.strokeDetails ? [...e.strokeDetails.map(d => ({ ...d }))] : [];
        this.strokeDetails.set(details);
        this.syncDetailLength(e?.strokes ?? 0, details);
    }
    ngOnDestroy(): void {
        this.navSvc.show();
    }
    // ── Stroke stepper ────────────────────────────────────────────────────
    addStroke(): void {
        const n = this.strokes() + 1;
        this.strokes.set(n);
        this.strokeDetails.update(d => {
            const arr = [...d];
            arr.push({});
            return arr;
        });
    }

    removeStroke(): void {
        if (this.strokes() <= 0) return;
        const n = this.strokes() - 1;
        this.strokes.set(n);
        this.strokeDetails.update(d => d.slice(0, n));
    }

    setStrokes(n: number): void {
        if (n < 0) return;
        this.strokes.set(n);
        this.syncDetailLength(n, this.strokeDetails());
    }

    private syncDetailLength(count: number, existing: StrokeDetail[]): void {
        if (count <= 0) { this.strokeDetails.set([]); return; }
        const arr = [...existing];
        while (arr.length < count) arr.push({});
        this.strokeDetails.set(arr.slice(0, count));
    }

    // ── Putts ─────────────────────────────────────────────────────────────
    addPutt(): void { this.putts.update(n => n + 1); }
    removePutt(): void { if (this.putts() > 0) this.putts.update(n => n - 1); }

    // ── Penalties ─────────────────────────────────────────────────────────
    addPenalty(): void { this.penalties.update(n => n + 1); }
    removePenalty(): void { if (this.penalties() > 0) this.penalties.update(n => n - 1); }

    // ── Fairway ───────────────────────────────────────────────────────────
    setFairway(val: boolean | null): void {
        this.fairwayHit.set(val);
        if (val !== false) this.fairwayMiss.set(null);
    }

    // ── GIR ───────────────────────────────────────────────────────────────
    setGir(val: boolean): void {
        this.gir.set(this.gir() === val ? null : val);
    }

    // ── Stroke details ────────────────────────────────────────────────────
    updateDetailClub(idx: number, club: string): void {
        this.strokeDetails.update(d => {
            const arr = [...d];
            arr[idx] = { ...arr[idx], club };
            return arr;
        });
        this.clubPickerIdx.set(null);
    }

    updateDetailDistance(idx: number, value: string): void {
        const dist = parseInt(value);
        this.strokeDetails.update(d => {
            const arr = [...d];
            arr[idx] = { ...arr[idx], distanceYards: isNaN(dist) ? undefined : dist };
            return arr;
        });
    }

    // ── Save / Cancel ──────────────────────────────────────────────────────
    save(): void {
        const score: HoleScore = {
            strokes: this.strokes() || null,
            putts: this.putts() || null,
            penalties: this.penalties() || undefined,
            fairwayHit: this.fairwayHit(),
            fairwayMiss: this.fairwayMiss() ?? undefined,
            gir: this.gir(),
            strokeDetails: this.strokeDetails().some(d => d.club || d.distanceYards)
                ? this.strokeDetails()
                : undefined,
        };
        this.saved.emit(score);
    }

    cancel(): void {
        this.cancelled.emit();
    }

    strokeLabel(idx: number): string {
        const labels = ['Tee', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        return labels[idx] ?? `#${idx + 1}`;
    }

    scoreBadge(n: number): string {
        const diff = n - this.ctx().par;
        if (n === 1) return 'ace';
        if (diff <= -2) return 'eagle';
        if (diff === -1) return 'birdie';
        if (diff === 0) return 'par';
        if (diff === 1) return 'bogey';
        if (diff === 2) return 'double';
        return 'triple';
    }
}
