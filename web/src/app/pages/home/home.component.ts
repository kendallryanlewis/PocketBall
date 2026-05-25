import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { CoursesService } from '../../services/courses.service';
import { ThemeService } from '../../services/theme.service';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-home',
    imports: [RouterLink, DatePipe, ReplacePipe, TitleCasePipe],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    private rounds = inject(RoundsService);
    private players = inject(PlayersService);
    private courses = inject(CoursesService);
    theme = inject(ThemeService);

    isDark = this.theme.resolved;
    me = this.players.me;
    activeRound = this.rounds.active;
    recentRounds = computed(() => this.rounds.history().slice(0, 3));

    stats = computed(() => {
        const me = this.me();
        if (!me) return null;
        return {
            rounds: me.roundsPlayed,
            wins: me.wins,
            best: this.rounds.bestRound(me.id),
            avg: this.rounds.avgScore(me.id),
            trophies: this.players.trophiesFor(me.id).length,
        };
    });

    toggle() { this.theme.toggle(); }
}
