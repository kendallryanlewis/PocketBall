import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { getFirestoreDb } from '../firebase.config';

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
    private auth = inject(AuthService);
    private profileSvc = inject(ProfileService);

    private _clubs = signal<ClubYardage[]>(
        this.storage.get<ClubYardage[]>(STORAGE_KEY, DEFAULT_CLUBS)
    );

    readonly clubs = this._clubs.asReadonly();

    /** Only clubs the user has filled in (yards set) */
    readonly filledClubs = computed(() => this._clubs().filter(c => c.yards !== null));

    constructor() {
        effect(() => {
            const userId = this.auth.user()?.userId;
            if (userId) this.syncFromFirestore(userId);
        });
    }

    private async syncFromFirestore(userId: string): Promise<void> {
        try {
            const db = getFirestoreDb();
            const snap = await getDoc(doc(db, 'users', userId, 'settings', 'clubs'));
            if (snap.exists()) {
                const clubs = (snap.data()['clubs'] ?? DEFAULT_CLUBS) as ClubYardage[];
                this._clubs.set(clubs);
                this.storage.set(STORAGE_KEY, clubs);
            } else {
                // First login — push current clubs (may have user's existing data).
                await setDoc(doc(db, 'users', userId, 'settings', 'clubs'),
                    { clubs: this._clubs() });
            }
        } catch {
            // Offline — localStorage data is already loaded.
        }
    }

    private fsPersist(): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        setDoc(doc(getFirestoreDb(), 'users', userId, 'settings', 'clubs'),
            { clubs: this._clubs() })
            .catch(() => {});
    }

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
        this.fsPersist();
        // Also mirror clubs into the public profile for sharing / search.
        const userId = this.auth.user()?.userId;
        if (userId) {
            this.profileSvc.updateClubs(
                userId,
                this._clubs().map(c => ({ id: c.id, name: c.name, yards: c.yards })),
            );
        }
    }
}
