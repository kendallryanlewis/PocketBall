import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayersService } from '../../services/players.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService, PublicProfile } from '../../services/profile.service';
import { BridgeService } from '../../services/bridge.service';
import { QrService } from '../../services/qr.service';
import { ToastService } from '../../services/toast.service';
import { QrModalComponent } from '../../components/qr-modal/qr-modal.component';
import { NavService } from '../../services/nav.service';

@Component({
    selector: 'app-friends',
    imports: [RouterLink, FormsModule, QrModalComponent],
    templateUrl: './friends.component.html',
    styleUrl: './friends.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsComponent {
    private playersService = inject(PlayersService);
    private auth = inject(AuthService);
    private profileSvc = inject(ProfileService);
    private bridge = inject(BridgeService);
    private qrSvc = inject(QrService);
    private toast = inject(ToastService);
    private navSvc = inject(NavService);

    me = this.playersService.me;
    friends = this.playersService.friends;
    authUser = this.auth.user;

    addMode = signal(false);
    deleteTarget = signal<string | null>(null);

    /** Firestore user search */
    searchQuery = signal('');
    searching = signal(false);
    searchResults = signal<PublicProfile[]>([]);
    searchError = signal('');
    private _searchTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        effect(() => {
            const anyOpen = this.addMode() || !!this.deleteTarget() || this.showMyQr();
            anyOpen ? this.navSvc.hide() : this.navSvc.show();
        });
    }

    /** Show the current user's own friend QR */
    showMyQr = signal(false);
    myQrValue = computed(() => this.qrSvc.friendQrValue(this.authUser(), this.me() ?? null));

    /** Scanning state */
    scanning = signal(false);
    scanError = signal('');

    /** Manual QR paste fallback (when no native bridge) */
    showPasteField = signal(false);
    pasteValue = signal('');

    get myCode(): string {
        return this.authUser()?.friendCode ?? this.me()?.friendCode ?? '—';
    }

    shareMyCode(): void {
        const code = this.myCode;
        const text = `Add me on Carnivore Golf! My friend code: ${code}`;
        this.bridge.shareText(text);
    }

    onSearchInput(e: Event): void {
        const val = (e.target as HTMLInputElement).value;
        this.searchQuery.set(val);
        if (this._searchTimer) clearTimeout(this._searchTimer);
        if (!val.trim()) { this.searchResults.set([]); this.searchError.set(''); return; }
        this._searchTimer = setTimeout(() => this.searchUsers(), 400);
    }

    async searchUsers(): Promise<void> {
        const q = this.searchQuery().trim();
        if (!q) { this.searchResults.set([]); return; }
        this.searching.set(true);
        this.searchError.set('');
        try {
            const results = await this.profileSvc.searchUsers(q);
            // Exclude self
            const myId = this.authUser()?.userId;
            this.searchResults.set(results.filter(r => r.userId !== myId));
            if (results.length === 0) this.searchError.set('No users found.');
        } catch {
            this.searchError.set('Search failed. Check your connection.');
        } finally {
            this.searching.set(false);
        }
    }

    addFromProfile(profile: PublicProfile): void {
        if (this.playersService.getByFriendCode(profile.friendCode)) {
            this.toast.info(`${profile.displayName} is already in your list.`);
            return;
        }
        this.playersService.addFriendFromProfile(profile);
        this.toast.success(`${profile.displayName} added!`);
        this.searchResults.set([]);
        this.searchQuery.set('');
        this.addMode.set(false);
    }

    /** Trigger the native QR scanner to add a friend. */
    async scanFriendQr(): Promise<void> {
        if (!this.bridge.available) {
            this.showPasteField.set(true);
            return;
        }
        this.scanning.set(true);
        this.scanError.set('');
        try {
            const raw = await this.bridge.scanQR();
            if (!raw) return;
            this.applyQrResult(raw);
        } catch {
            this.scanError.set('Scan failed. Try again.');
        } finally {
            this.scanning.set(false);
        }
    }

    /** Apply a pasted QR string (web fallback). */
    applyPaste(): void {
        const raw = this.pasteValue().trim();
        if (!raw) { this.scanError.set('Paste a QR code link.'); return; }
        this.applyQrResult(raw);
        this.showPasteField.set(false);
        this.pasteValue.set('');
    }

    private applyQrResult(raw: string): void {
        const friend = this.qrSvc.parseFriendQr(raw);
        if (friend) {
            if (friend.code && this.playersService.getByFriendCode(friend.code)) {
                this.toast.info(`${friend.name} is already in your friends list.`);
                return;
            }
            this.playersService.addFriend(friend.name, friend.code || undefined);
            this.addMode.set(false);
            this.toast.success(`${friend.name} added as a friend!`);
            return;
        }
        this.scanError.set('Not a valid Carnivore Golf QR code.');
    }

    confirmDelete(id: string): void { this.deleteTarget.set(id); }
    cancelDelete(): void { this.deleteTarget.set(null); }

    doDelete(): void {
        const id = this.deleteTarget();
        if (id) this.playersService.deletePlayer(id);
        this.deleteTarget.set(null);
    }

    updateName(id: string, name: string): void {
        const p = this.playersService.getById(id);
        if (!p) return;
        const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
        this.playersService.savePlayer({ ...p, name: name.trim(), initials });
    }

    inviteToDownload(): void {
        const code = this.myCode;
        const text = `Join me on Carnivore Golf! ⛳\n\nTrack rounds, beat your friends, claim trophies.\n\nDownload on the App Store:\nhttps://apps.apple.com/app/carnivore-golf${code && code !== '—' ? `\n\nUse my friend code to connect with me: ${code}` : ''}`;
        if (navigator.share) {
            navigator.share({ title: 'Join Carnivore Golf!', text }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(text).catch(() => { });
        }
    }
}
