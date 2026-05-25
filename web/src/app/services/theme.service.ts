import { Injectable, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { BridgeService } from './bridge.service';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private storage = inject(StorageService);
    private bridge = inject(BridgeService);
    readonly preference = signal<Theme>(this.storage.get<Theme>('cg_theme', 'system'));
    readonly resolved = signal<'light' | 'dark'>('light');

    private mq = window.matchMedia('(prefers-color-scheme: dark)');

    constructor() {
        this.mq.addEventListener('change', () => this.apply());
        effect(() => {
            const pref = this.preference();
            this.storage.set('cg_theme', pref);
            this.apply();
        });
        this.apply();
    }

    set(theme: Theme): void {
        this.preference.set(theme);
    }

    setPreference(theme: string): void {
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            this.preference.set(theme);
        }
    }

    toggle(): void {
        const cur = this.resolved();
        this.set(cur === 'dark' ? 'light' : 'dark');
    }

    private apply(): void {
        const pref = this.preference();
        const dark = pref === 'dark' || (pref === 'system' && this.mq.matches);
        const resolved = dark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', resolved);
        this.resolved.set(resolved);
        // Tell SwiftUI which resolved theme is active so it can update its bg color.
        this.bridge.send('setTheme', { resolved });
    }
}
