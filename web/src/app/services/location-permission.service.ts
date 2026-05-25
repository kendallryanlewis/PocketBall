import { Injectable, signal } from '@angular/core';

export type LocationPermissionStatus = 'granted' | 'denied' | 'notDetermined';

/**
 * Tracks the native iOS location permission status, kept in sync via the
 * Swift bridge.  Components read `status()` to show/hide location features.
 */
@Injectable({ providedIn: 'root' })
export class LocationPermissionService {
    readonly status = signal<LocationPermissionStatus>('notDetermined');

    constructor() {
        // Listen for status updates pushed by Swift whenever CLAuthorizationStatus changes.
        window.addEventListener('locationPermission', (e: Event) => {
            const detail = (e as CustomEvent<{ status: string }>).detail;
            this.status.set(this.parse(detail.status));
        });
        // Request the current status from the bridge immediately.
        this.postBridge('getLocationPermission');
    }

    /** Call when the user taps a location-gated feature to trigger the iOS prompt. */
    requestPermission(): void {
        this.postBridge('requestLocationPermission');
    }

    private parse(s: string): LocationPermissionStatus {
        if (s === 'granted') return 'granted';
        if (s === 'denied') return 'denied';
        return 'notDetermined';
    }

    private postBridge(action: string): void {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkit?.messageHandlers?.nativeBridge?.postMessage({ action });
        } catch { /* running outside WKWebView (browser dev) */ }
    }
}
