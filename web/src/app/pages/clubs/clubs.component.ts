import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubsService, ClubYardage } from '../../services/clubs.service';

@Component({
    selector: 'app-clubs',
    imports: [RouterLink, FormsModule],
    templateUrl: './clubs.component.html',
    styleUrl: './clubs.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubsComponent {
    private clubsService = inject(ClubsService);

    clubs = this.clubsService.clubs;

    /** Which club row is expanded for note editing */
    expanded = signal<string | null>(null);

    toggleExpand(id: string): void {
        this.expanded.set(this.expanded() === id ? null : id);
    }

    updateYards(club: ClubYardage, raw: string): void {
        const yards = raw.trim() === '' ? null : parseInt(raw, 10);
        this.clubsService.update(club.id, isNaN(yards as number) ? null : yards, club.notes);
    }

    updateNotes(club: ClubYardage, notes: string): void {
        this.clubsService.update(club.id, club.yards, notes);
    }

    clearClub(club: ClubYardage): void {
        this.clubsService.update(club.id, null, '');
        if (this.expanded() === club.id) this.expanded.set(null);
    }

    filledCount(): number {
        return this.clubs().filter(c => c.yards !== null).length;
    }
}
