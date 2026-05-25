import { Component, inject, input, output, effect, signal } from '@angular/core';
import { QrService } from '../../services/qr.service';
import { BridgeService } from '../../services/bridge.service';

@Component({
    selector: 'app-qr-modal',
    templateUrl: './qr-modal.component.html',
    styleUrl: './qr-modal.component.css',
})
export class QrModalComponent {
    private qrSvc = inject(QrService);
    private bridge = inject(BridgeService);

    /** The string to encode as a QR code. */
    qrValue = input.required<string>();
    title = input('');
    subtitle = input('');
    closed = output<void>();

    qrDataUrl = signal<string | null>(null);

    constructor() {
        effect(() => {
            const val = this.qrValue();
            if (!val) return;
            this.qrDataUrl.set(null);
            void this.qrSvc.generate(val).then(url => this.qrDataUrl.set(url));
        });
    }

    share(): void {
        this.bridge.shareText(this.qrValue());
    }

    copy(): void {
        navigator.clipboard?.writeText(this.qrValue()).catch(() => { });
    }
}
