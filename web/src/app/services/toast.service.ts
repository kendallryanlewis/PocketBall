import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    /** If provided, an auto-dismissing toast becomes a persistent one with a Retry button. */
    retry?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    readonly toasts = signal<Toast[]>([]);

    show(message: string, type: Toast['type'] = 'info', retry?: () => void, duration = 4000): void {
        const id = crypto.randomUUID();
        this.toasts.update(t => [...t, { id, message, type, retry }]);
        // Only auto-dismiss when there is no retry action
        if (!retry) {
            setTimeout(() => this.dismiss(id), duration);
        }
    }

    success(message: string): void { this.show(message, 'success'); }
    error(message: string, retry?: () => void): void { this.show(message, 'error', retry); }
    info(message: string): void { this.show(message, 'info'); }

    dismiss(id: string): void {
        this.toasts.update(t => t.filter(x => x.id !== id));
    }
}
