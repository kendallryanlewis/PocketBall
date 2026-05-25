import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayersService } from '../../services/players.service';
import { AuthService } from '../../services/auth.service';
import { BridgeService } from '../../services/bridge.service';
import { QrService } from '../../services/qr.service';
import { ToastService } from '../../services/toast.service';
import { QrModalComponent } from '../../components/qr-modal/qr-modal.component';

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
    private bridge = inject(BridgeService);
    private qrSvc = inject(QrService);
    private toast = inject(ToastService);

    me = this.playersService.me;
    friends = this.playersService.friends;
    authUser = this.auth.user;

    addMode = signal(false);
    newName = signal('');
    newCode = signal('');
    addError = signal('');
    deleteTarget = signal<string | null>(null);

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

    addFriend(): void {
        const name = this.newName().trim();
        const code = this.newCode().trim().toUpperCase();

        if (!name) { this.addError.set('Enter a name.'); return; }

        if (code && this.playersService.getByFriendCode(code)) {
            this.addError.set('A friend with that code already exists.');
            return;
        }

        this.playersService.addFriend(name, code || undefined);
        this.newName.set('');
        this.newCode.set('');
        this.addError.set('');
        this.addMode.set(false);
        this.toast.success(`${name} added!`);
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
