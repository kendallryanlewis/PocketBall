import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css',
})
export class ToastComponent {
    toastService = inject(ToastService);
    toasts = this.toastService.toasts;

    dismiss(id: string): void {
        this.toastService.dismiss(id);
    }

    retry(id: string, fn: (() => void) | undefined): void {
        fn?.();
        this.toastService.dismiss(id);
    }
}
