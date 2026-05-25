import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlayersService } from '../../services/players.service';
import { ThemeService } from '../../services/theme.service';

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
    private router = inject(Router);
    theme = inject(ThemeService);

    authUser = this.auth.user;
    me = this.players.me;

    editingName = signal(false);
    newName = signal(this.me()?.name ?? '');
    preference = this.theme.preference;

    showDeleteConfirm = signal(false);

    saveName(): void {
        const name = this.newName().trim();
        if (!name) return;
        const me = this.me();
        if (me) {
            const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            this.players.savePlayer({ ...me, name, initials });
        }
        this.auth.updateDisplayName(name);
        this.editingName.set(false);
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

    deleteAccount(): void {
        this.auth.deleteAccount();
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

