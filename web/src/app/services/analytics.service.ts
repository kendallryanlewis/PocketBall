import { Injectable, inject } from '@angular/core';
import { BridgeService } from './bridge.service';

/**
 * Privacy-respecting analytics — events are forwarded through the native bridge
 * so Swift can route them to any analytics SDK (Firebase Analytics, Amplitude, etc.)
 * without shipping an analytics SDK in the web bundle.
 * No PII is ever sent: only event names and non-identifying params.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private bridge = inject(BridgeService);

    track(event: string, params?: Record<string, string | number | boolean>): void {
        // Only send if the native bridge is available; silently no-ops in browser dev
        if (this.bridge.available) {
            this.bridge.send('analytics', { event, ...(params ?? {}) });
        }
    }
}
