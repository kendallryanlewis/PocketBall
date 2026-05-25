import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { CoursesService } from '../../services/courses.service';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { AnalyticsService } from '../../services/analytics.service';
import { GAME_TYPES } from '../../models/round.model';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-new-round',
    imports: [FormsModule, RouterLink, ReplacePipe, TitleCasePipe],
    templateUrl: './new-round.component.html',
    styleUrl: './new-round.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewRoundComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private coursesService = inject(CoursesService);
    private roundsService = inject(RoundsService);
    private analytics = inject(AnalyticsService);
    playersService = inject(PlayersService);

    courses = this.coursesService.courses;
    allPlayers = this.playersService.players;
    gameTypes = GAME_TYPES;

    /** Existing in-progress round, if any */
    activeRound = this.roundsService.active;

    selectedCourseId = signal(this.route.snapshot.queryParamMap.get('courseId') ?? '');
    selectedGameType = signal<string>('stroke_play');
    selectedPlayerIds = signal<string[]>([this.playersService.me()?.id ?? ''].filter(Boolean));
    newFriendName = signal('');
    addingFriend = signal(false);
    step = signal<'resume' | 'course' | 'players' | 'game'>(
        // If an active round exists, show the resume prompt first
        this.roundsService.active() ? 'resume' : 'course'
    );

    selectedCourse = computed(() => this.coursesService.getById(this.selectedCourseId()));

    categoryFilter = signal<'all' | 'individual' | 'team' | 'group'>('all');
    filteredGameTypes = computed(() => {
        const f = this.categoryFilter();
        return f === 'all' ? this.gameTypes : this.gameTypes.filter(g => g.category === f);
    });

    canStartRound = computed(() => {
        const gt = GAME_TYPES.find(g => g.id === this.selectedGameType());
        const players = this.selectedPlayerIds().length;
        return !!this.selectedCourseId() && !!gt && players >= gt.minPlayers && players <= gt.maxPlayers;
    });

    resumeRound(): void {
        const r = this.activeRound();
        if (r) this.router.navigate(['/app/rounds', r.id]);
    }

    discardAndNew(): void {
        const r = this.activeRound();
        if (r) this.roundsService.complete(r.id);
        this.step.set('course');
    }

    togglePlayer(id: string): void {
        this.selectedPlayerIds.update(ids =>
            ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
        );
    }

    addFriend(): void {
        const name = this.newFriendName().trim();
        if (!name) return;
        const p = this.playersService.addFriend(name);
        this.selectedPlayerIds.update(ids => [...ids, p.id]);
        this.newFriendName.set('');
        this.addingFriend.set(false);
    }

    start(): void {
        const course = this.selectedCourse();
        if (!course || !this.canStartRound()) return;

        const holes = course.holes.length;
        const playerRounds = this.selectedPlayerIds().map(pid => ({
            playerId: pid,
            scores: Array.from({ length: holes }, () => ({ strokes: null })),
        }));

        const round = this.roundsService.create({
            courseId: course.id,
            courseName: course.name,
            holes,
            gameType: this.selectedGameType() as any,
            playerRounds,
        });

        this.analytics.track('round_start', {
            game_type: this.selectedGameType(),
            hole_count: holes,
            player_count: this.selectedPlayerIds().length,
        });
        this.router.navigate(['/app/rounds', round.id]);
    }

    back(): void {
        const s = this.step();
        if (s === 'resume' || s === 'course') this.router.navigate(['/app/home']);
        else if (s === 'players') this.step.set('course');
        else this.step.set('players');
    }

    next(): void {
        const s = this.step();
        if (s === 'course' && this.selectedCourseId()) this.step.set('players');
        else if (s === 'players') this.step.set('game');
    }
}
