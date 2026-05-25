import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PlayersService } from '../../services/players.service';
import { RoundsService } from '../../services/rounds.service';
import { BridgeService } from '../../services/bridge.service';

@Component({
    selector: 'app-trophy',
    imports: [DatePipe],
    templateUrl: './trophy.component.html',
    styleUrl: './trophy.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrophyComponent {
    private playersService = inject(PlayersService);
    private roundsService = inject(RoundsService);
    private bridge = inject(BridgeService);

    players = this.playersService.players;
    trophies = this.playersService.trophies;

    selectedPlayerId = signal<string | null>(null);

    filtered = computed(() => {
        const pid = this.selectedPlayerId();
        return pid ? this.trophies().filter(t => t.playerId === pid) : this.trophies();
    });

    stats = computed(() => {
        return this.players().map(p => ({
            player: p,
            wins: this.roundsService.wins(p.id),
            rounds: p.roundsPlayed,
            best: this.roundsService.bestRound(p.id),
            avg: this.roundsService.avgScore(p.id),
            trophies: this.playersService.trophiesFor(p.id).length,
        }));
    });

    shareTrophy(trophy: any): void {
        const text = `🏆 ${trophy.title}\n${trophy.courseName} · ${trophy.description}`;
        this.bridge.shareText(text);
    }
}
