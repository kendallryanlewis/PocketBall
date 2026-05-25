import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'signup' | 'forgot';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
    private auth = inject(AuthService);
    private router = inject(Router);

    mode = signal<Mode>('login');
    loading = signal(false);
    error = signal('');
    forgotSent = signal(false);

    // Form fields
    name = '';
    email = '';
    password = '';
    confirmPassword = '';

    ngOnInit(): void {
        if (this.auth.isLoggedIn()) {
            this.router.navigate(['/app'], { replaceUrl: true });
        }
    }

    setMode(m: Mode): void {
        this.mode.set(m);
        this.error.set('');
        this.forgotSent.set(false);
    }

    async submitLocal(): Promise<void> {
        this.error.set('');
        if (!this.email.trim() || !this.password) {
            this.error.set('Please fill in all fields.');
            return;
        }
        if (this.mode() === 'signup') {
            if (!this.name.trim()) { this.error.set('Please enter your name.'); return; }
            if (this.password.length < 6) { this.error.set('Password must be at least 6 characters.'); return; }
            if (this.password !== this.confirmPassword) { this.error.set('Passwords do not match.'); return; }
        }
        this.loading.set(true);
        try {
            if (this.mode() === 'signup') {
                await this.auth.signUpLocal(this.name.trim(), this.email.trim(), this.password);
            } else {
                await this.auth.signInLocal(this.email.trim(), this.password);
            }
            this.router.navigate(['/app'], { replaceUrl: true });
        } catch (e: unknown) {
            this.error.set(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            this.loading.set(false);
        }
    }

    async sendForgot(): Promise<void> {
        if (!this.email.trim()) { this.error.set('Enter your email address above.'); return; }
        this.loading.set(true);
        this.error.set('');
        try {
            await this.auth.sendPasswordReset(this.email.trim());
            this.forgotSent.set(true);
        } catch (e: unknown) {
            this.error.set(e instanceof Error ? e.message : 'Could not send reset email.');
        } finally {
            this.loading.set(false);
        }
    }

    async signInApple(): Promise<void> {
        this.error.set('');
        this.loading.set(true);
        try {
            await this.auth.signInWithApple();
            this.router.navigate(['/app'], { replaceUrl: true });
        } catch {
            this.error.set('Apple Sign In was cancelled or failed.');
        } finally {
            this.loading.set(false);
        }
    }
}

