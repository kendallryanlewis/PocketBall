import { ChangeDetectionStrategy, Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { RoundsService } from '../../services/rounds.service';
import { NavService } from '../../services/nav.service';

@Component({
    selector: 'app-shell',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
    theme = inject(ThemeService);
    rounds = inject(RoundsService);
    navSvc = inject(NavService);
    private destroyRef = inject(DestroyRef);

    isDark = this.theme.resolved;
    activeRound = this.rounds.active;
    offline = signal(!navigator.onLine);

    ngOnInit(): void {
        const onOnline = () => this.offline.set(false);
        const onOffline = () => this.offline.set(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        });
    }
}
