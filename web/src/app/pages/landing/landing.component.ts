import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {
    private router = inject(Router);
    private theme = inject(ThemeService);
    private auth = inject(AuthService);

    isDark = this.theme.resolved;

    ngOnInit(): void {
        // Skip landing if already authenticated
        if (this.auth.isLoggedIn()) {
            this.router.navigate(['/app'], { replaceUrl: true });
        }
    }

    enter(): void {
        this.router.navigate(['/login']);
    }

    toggleTheme(): void {
        this.theme.toggle();
    }
}
