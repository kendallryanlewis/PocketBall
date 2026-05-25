import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';

export interface ClubYardage {
    id: string;       // e.g. 'driver', '3w', '7i', 'pw', etc.
    name: string;     // display name
    yards: number | null;
    notes: string;
}

const STORAGE_KEY = 'cg_clubs';

const DEFAULT_CLUBS: ClubYardage[] = [
    { id: 'driver', name: 'Driver', yards: null, notes: '' },
    { id: '3w', name: '3 Wood', yards: null, notes: '' },
    { id: '5w', name: '5 Wood', yards: null, notes: '' },
    { id: '3h', name: '3 Hybrid', yards: null, notes: '' },
    { id: '4h', name: '4 Hybrid', yards: null, notes: '' },
    { id: '4i', name: '4 Iron', yards: null, notes: '' },
    { id: '5i', name: '5 Iron', yards: null, notes: '' },
    { id: '6i', name: '6 Iron', yards: null, notes: '' },
    { id: '7i', name: '7 Iron', yards: null, notes: '' },
    { id: '8i', name: '8 Iron', yards: null, notes: '' },
    { id: '9i', name: '9 Iron', yards: null, notes: '' },
    { id: 'pw', name: 'Pitching Wedge', yards: null, notes: '' },
    { id: 'gw', name: 'Gap Wedge', yards: null, notes: '' },
    { id: 'sw', name: 'Sand Wedge', yards: null, notes: '' },
    { id: 'lw', name: 'Lob Wedge', yards: null, notes: '' },
    { id: 'putter', name: 'Putter', yards: null, notes: '' },
];

@Injectable({ providedIn: 'root' })
export class ClubsService {
    private storage = inject(StorageService);

    private _clubs = signal<ClubYardage[]>(
        this.storage.get<ClubYardage[]>(STORAGE_KEY, DEFAULT_CLUBS)
    );

    readonly clubs = this._clubs.asReadonly();

    /** Only clubs the user has filled in (yards set) */
    readonly filledClubs = computed(() => this._clubs().filter(c => c.yards !== null));

    update(id: string, yards: number | null, notes: string): void {
        this._clubs.update(list =>
            list.map(c => c.id === id ? { ...c, yards, notes } : c)
        );
        this.persist();
    }

    reorder(ids: string[]): void {
        const map = new Map(this._clubs().map(c => [c.id, c]));
        const reordered = ids.map(id => map.get(id)).filter(Boolean) as ClubYardage[];
        // append any clubs not in the ids list at the end
        const rest = this._clubs().filter(c => !ids.includes(c.id));
        this._clubs.set([...reordered, ...rest]);
        this.persist();
    }

    private persist(): void {
        this.storage.set(STORAGE_KEY, this._clubs());
    }
}
