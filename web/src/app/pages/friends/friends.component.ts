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
import { Player } from '../../models/player.model';
import { FriendRequestService, FriendRequest } from '../../services/friend-request.service';

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
    private friendReqSvc = inject(FriendRequestService);

    me = this.playersService.me;
    friends = this.playersService.friends;
    authUser = this.auth.user;

    /** Incoming friend requests (real-time from Firestore) */
    incomingRequests = this.friendReqSvc.incoming;
    pendingCount = this.friendReqSvc.pendingCount;

    addMode = signal(false);
    deleteTarget = signal<string | null>(null);

    /** Friend profile sheet */
    selectedFriend = signal<Player | null>(null);
    selectedProfile = signal<PublicProfile | null>(null);
    loadingProfile = signal(false);

    /** Firestore user search */
    searchQuery = signal('');
    searching = signal(false);
    searchResults = signal<PublicProfile[]>([]);
    searchError = signal('');
    private _searchTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        effect(() => {
            const anyOpen = this.addMode() || !!this.deleteTarget() || this.showMyQr() || !!this.selectedFriend();
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
        console.log('[Friends] input changed, scheduling search for:', val);
        this._searchTimer = setTimeout(() => this.searchUsers(), 400);
    }

    async searchUsers(): Promise<void> {
        const q = this.searchQuery().trim();
        if (!q) { this.searchResults.set([]); return; }
        console.log('[Friends] searchUsers() firing with query:', q);
        this.searching.set(true);
        this.searchError.set('');
        try {
            const results = await this.profileSvc.searchUsers(q);
            console.log('[Friends] raw results:', results.length, results.map(r => r.displayName));
            // Exclude self
            const myId = this.authUser()?.userId;
            const filtered = results.filter(r => r.userId !== myId);
            console.log('[Friends] after self-filter:', filtered.length);
            this.searchResults.set(filtered);
            if (filtered.length === 0) this.searchError.set('No users found.');
        } catch (err) {
            console.error('[Friends] searchUsers error:', err);
            this.searchError.set('Search failed. Check your connection.');
        } finally {
            this.searching.set(false);
        }
    }

    async addFromProfile(profile: PublicProfile): Promise<void> {
        if (this.playersService.getByFriendCode(profile.friendCode)) {
            this.toast.info(`${profile.displayName} is already in your list.`);
            return;
        }
        try {
            await this.friendReqSvc.sendRequest({
                userId: profile.userId,
                displayName: profile.displayName,
                friendCode: profile.friendCode,
                photoURL: profile.photoURL,
            });
            this.toast.success(`Friend request sent to ${profile.displayName}!`);
            this.searchResults.set([]);
            this.searchQuery.set('');
        } catch {
            this.toast.error('Failed to send request. Try again.');
        }
    }

    async acceptRequest(req: FriendRequest): Promise<void> {
        try {
            await this.friendReqSvc.acceptRequest(req);
            this.toast.success(`${req.fromDisplayName} added to your friends!`);
        } catch {
            this.toast.error('Failed to accept request.');
        }
    }

    async declineRequest(req: FriendRequest): Promise<void> {
        try {
            await this.friendReqSvc.declineRequest(req);
            this.toast.info('Request declined.');
        } catch {
            this.toast.error('Failed to decline request.');
        }
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
        this.selectedFriend.set(null);
        this.selectedProfile.set(null);
    }

    async openFriendProfile(f: Player): Promise<void> {
        this.selectedFriend.set(f);
        this.selectedProfile.set(null);
        if (f.friendCode || f.username || f.email) {
            this.loadingProfile.set(true);
            try {
                // Try fetching their Firestore profile for clubs / photo
                const code = f.friendCode;
                if (code) {
                    const results = await this.profileSvc.searchUsers(code);
                    const match = results.find(r => r.friendCode === code);
                    if (match) this.selectedProfile.set(match);
                }
            } catch { }
            finally { this.loadingProfile.set(false); }
        }
    }

    closeFriendProfile(): void {
        this.selectedFriend.set(null);
        this.selectedProfile.set(null);
    }

    removeSelectedFriend(): void {
        const f = this.selectedFriend();
        if (f) {
            this.selectedFriend.set(null);
            this.selectedProfile.set(null);
            this.deleteTarget.set(f.id);
        }
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
