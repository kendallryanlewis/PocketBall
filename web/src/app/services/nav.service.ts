import { Injectable, signal } from '@angular/core';

/**
 * Controls the bottom nav bar visibility.
 * Call `hide()` when a bottom overlay opens, `show()` when it closes.
 * The shell listens to `hidden` and slides the nav off-screen.
 */
@Injectable({ providedIn: 'root' })
export class NavService {
    readonly hidden = signal(false);

    hide(): void { this.hidden.set(true); }
    show(): void { this.hidden.set(false); }
}
