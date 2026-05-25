import { ChangeDetectionStrategy, Component, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BridgeService } from '../../services/bridge.service';
import { CoursesService } from '../../services/courses.service';
import { ToastService } from '../../services/toast.service';
import { newCourse } from '../../models/course.model';

interface ScannedHole {
    number: number;
    par: number;
    handicap: number;
    yardage: number;
}

type ScanStep = 'capture' | 'scanning' | 'review' | 'error';

@Component({
    selector: 'app-scan-scorecard',
    imports: [FormsModule],
    templateUrl: './scan-scorecard.component.html',
    styleUrl: './scan-scorecard.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanScorecardComponent {
    private fileInputEl = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
    private router = inject(Router);
    private bridge = inject(BridgeService);
    private coursesService = inject(CoursesService);
    private toast = inject(ToastService);

    step = signal<ScanStep>('capture');
    errorMsg = signal('');
    previewUrl = signal<string | null>(null);
    courseName = signal('');
    holes = signal<ScannedHole[]>([]);

    front9 = computed(() => this.holes().slice(0, 9));
    back9 = computed(() => this.holes().slice(9, 18));
    has18 = computed(() => this.holes().length === 18);

    outPar = computed(() => this.front9().reduce((s, h) => s + h.par, 0));
    outYards = computed(() => this.front9().reduce((s, h) => s + h.yardage, 0));
    inPar = computed(() => this.back9().reduce((s, h) => s + h.par, 0));
    inYards = computed(() => this.back9().reduce((s, h) => s + h.yardage, 0));
    totPar = computed(() => this.outPar() + this.inPar());
    totYards = computed(() => this.outYards() + this.inYards());

    openCamera(): void {
        const el = this.fileInputEl().nativeElement;
        el.removeAttribute('capture');
        el.setAttribute('capture', 'environment');
        el.click();
    }

    openGallery(): void {
        this.fileInputEl().nativeElement.removeAttribute('capture');
        this.fileInputEl().nativeElement.click();
    }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        // Show image preview immediately
        const dataUrl = await this.readAsDataUrl(file);
        this.previewUrl.set(dataUrl);
        this.step.set('scanning');

        // Strip the data URL prefix — Swift expects raw base64
        const base64 = dataUrl.split(',')[1] ?? dataUrl;

        if (!this.bridge.available) {
            const msg = 'Scorecard scanning requires the native iOS app.';
            this.errorMsg.set(msg);
            this.toast.error(msg);
            this.step.set('error');
            input.value = '';
            return;
        }

        const result = await this.bridge.scanScorecard(base64);
        input.value = ''; // allow re-selecting the same file

        if (result && result.holes.length >= 9) {
            this.courseName.set(result.courseName);
            this.holes.set(result.holes.map(h => ({ ...h })));
            this.step.set('review');
        } else {
            const msg = result
                ? 'The scorecard was read but fewer than 9 holes were detected. Try a clearer photo with better lighting.'
                : 'Could not read the scorecard. Make sure the image is flat, well-lit, and in focus.';
            this.errorMsg.set(msg);
            this.toast.error(msg);
            this.step.set('error');
        }
    }

    updateHole(i: number, field: keyof ScannedHole, raw: string): void {
        const v = Number(raw);
        if (isNaN(v) || v < 0) return;
        this.holes.update(holes =>
            holes.map((h, idx) => idx === i ? { ...h, [field]: v } : h)
        );
    }

    saveAsCourse(): void {
        const name = this.courseName().trim() || 'Scanned Course';
        const course = newCourse({
            name,
            holes: this.holes().map(h => ({
                number: h.number,
                par: h.par,
                handicap: h.handicap,
                tees: [{ name: 'White', yards: h.yardage }],
            })),
        });
        this.coursesService.save(course);
        this.toast.success(`"${name}" saved to your courses`);
        this.router.navigate(['/app/courses', course.id]);
    }

    retake(): void {
        this.step.set('capture');
        this.previewUrl.set(null);
        this.holes.set([]);
        this.errorMsg.set('');
        this.courseName.set('');
    }

    back(): void {
        window.history.back();
    }

    private readAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
