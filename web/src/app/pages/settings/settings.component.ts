import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlayersService } from '../../services/players.service';
import { ProfileService } from '../../services/profile.service';
import { ThemeService } from '../../services/theme.service';
import { NavService } from '../../services/nav.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-settings',
    imports: [RouterLink, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
    private auth = inject(AuthService);
    private players = inject(PlayersService);
    private profileSvc = inject(ProfileService);
    private router = inject(Router);
    private toast = inject(ToastService);
    theme = inject(ThemeService);

    private navSvc = inject(NavService);

    authUser = this.auth.user;
    me = this.players.me;

    editingName = signal(false);
    newName = signal(this.me()?.name ?? '');

    uploadingPhoto = signal(false);
    preference = this.theme.preference;

    showDeleteConfirm = signal(false);

    constructor() {
        effect(() => {
            this.showDeleteConfirm() ? this.navSvc.hide() : this.navSvc.show();
        });
    }

    saveName(): void {
        const name = this.newName().trim();
        if (!name) return;
        const me = this.me();
        if (me) {
            const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            this.players.savePlayer({ ...me, name, initials });
        }
        this.auth.updateDisplayName(name);
        // Derive @handle from the display name (lowercase, alphanumeric + underscore)
        const handle = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (handle.length >= 3) this.auth.updateUsername(handle);
        this.editingName.set(false);
    }

    async onPhotoSelected(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const userId = this.authUser()?.userId;
        if (!userId) return;
        this.uploadingPhoto.set(true);
        try {
            const url = await this.profileSvc.uploadPhoto(userId, file);
            this.auth.updatePhotoURL(url);
            this.toast.success('Profile photo updated');
        } catch {
            this.toast.error('Photo upload failed. Try again.');
        } finally {
            this.uploadingPhoto.set(false);
        }
    }

    setTheme(pref: string): void {
        if (pref === 'light' || pref === 'dark' || pref === 'system') {
            this.theme.set(pref);
        }
    }

    signOut(): void {
        this.auth.signOut();
        this.router.navigate(['/'], { replaceUrl: true });
    }

    confirmDelete(): void { this.showDeleteConfirm.set(true); }
    cancelDelete(): void { this.showDeleteConfirm.set(false); }

    async deleteAccount(): Promise<void> {
        await this.auth.deleteAccount();
        this.router.navigate(['/'], { replaceUrl: true });
    }

    shareApp(): void {
        const code = this.authUser()?.friendCode ?? '';
        const text = `Join me on Carnivore Golf! ⛳\n\nTrack rounds, beat your friends, claim trophies.\n\nDownload on the App Store 👇\nhttps://apps.apple.com/app/carnivore-golf${code ? `\n\nUse my friend code to connect: ${code}` : ''}`;
        if (navigator.share) {
            navigator.share({ title: 'Carnivore Golf', text }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(text).catch(() => { });
        }
    }
}

