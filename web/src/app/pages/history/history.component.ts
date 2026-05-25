import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RoundsService } from '../../services/rounds.service';
import { PlayersService } from '../../services/players.service';
import { roundTotal, GAME_TYPES } from '../../models/round.model';
import { ReplacePipe } from '../../pipes/pipes';

@Component({
    selector: 'app-history',
    imports: [RouterLink, DatePipe, ReplacePipe, TitleCasePipe],
    templateUrl: './history.component.html',
    styleUrl: './history.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
    private roundsService = inject(RoundsService);
    playersService = inject(PlayersService);

    rounds = this.roundsService.history;
    filter = signal<string>('all');
    total = roundTotal;

    gameTypes = GAME_TYPES;

    filtered = computed(() => {
        const f = this.filter();
        const rs = this.rounds();
        return f === 'all' ? rs : rs.filter(r => r.gameType === f);
    });

    usedGameTypes = computed(() => {
        const used = new Set(this.rounds().map(r => r.gameType));
        return GAME_TYPES.filter(g => used.has(g.id));
    });

    playerName(id: string): string {
        return this.playersService.getById(id)?.name ?? 'Unknown';
    }

    deleteRound(id: string): void {
        this.roundsService.delete(id);
    }
}
