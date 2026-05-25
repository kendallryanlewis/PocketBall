import { Injectable } from '@angular/core';

declare global {
    interface Window {
        webkit?: {
            messageHandlers?: {
                nativeBridge?: {
                    postMessage: (msg: unknown) => void;
                };
            };
        };
    }
}

@Injectable({ providedIn: 'root' })
export class BridgeService {
    get available(): boolean {
        return !!window.webkit?.messageHandlers?.nativeBridge;
    }

    send(action: string, payload?: unknown): void {
        if (!this.available) return;
        window.webkit!.messageHandlers!.nativeBridge!.postMessage({ action, payload });
    }

    /**
     * Listen for a one-time event dispatched back from Swift.
     * Rejects after `timeoutMs` (default 30 s) so the listener is never orphaned.
     */
    once<T>(eventName: string, timeoutMs = 30_000): Promise<T> {
        return new Promise((resolve, reject) => {
            let timer: ReturnType<typeof setTimeout>;

            const handler = (e: Event) => {
                clearTimeout(timer);
                window.removeEventListener(eventName, handler);
                resolve((e as CustomEvent<T>).detail);
            };

            timer = setTimeout(() => {
                window.removeEventListener(eventName, handler);
                reject(new Error(`BridgeService.once('${eventName}') timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            window.addEventListener(eventName, handler);
        });
    }

    /** Scan a scorecard image; resolves with parsed hole data */
    async scanScorecard(base64: string): Promise<{ courseName: string; holes: { number: number; par: number; handicap: number; yardage: number }[] } | null> {
        if (!this.available) return null;
        const resultPromise = this.once<{ courseName: string; holes: { number: number; par: number; handicap: number; yardage: number }[] }>('scorecardScanResult');
        this.send('scanScorecard', { imageData: base64 });
        return resultPromise;
    }

    shareText(text: string): void {
        if (navigator.share) {
            navigator.share({ text }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(text).catch(() => { });
        }
    }

    /**
     * Ask Swift to open the camera QR scanner.
     * Resolves with the decoded string, or null if cancelled/unavailable.
     */
    async scanQR(timeoutMs = 60_000): Promise<string | null> {
        if (!this.available) return null;
        const resultPromise = this.once<{ value: string }>('qrScanResult', timeoutMs);
        this.send('scanQR', {});
        try {
            const result = await resultPromise;
            return result.value ?? null;
        } catch {
            return null;
        }
    }
}
