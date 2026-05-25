import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../services/courses.service';
import { BridgeService } from '../../services/bridge.service';
import { ToastService } from '../../services/toast.service'; import { AnalyticsService } from '../../services/analytics.service'; import { Course, Hole, newCourse } from '../../models/course.model';
import { GolfCourseApiService, OverpassCourse, OsmHole } from '../../services/golf-course-api.service';

@Component({
    selector: 'app-create-course',
    imports: [FormsModule],
    templateUrl: './create-course.component.html',
    styleUrl: './create-course.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCourseComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private coursesService = inject(CoursesService);
    private bridge = inject(BridgeService);
    private toast = inject(ToastService);
    private analytics = inject(AnalyticsService);
    private golfApi = inject(GolfCourseApiService);

    /** true = editing an existing course, false = creating new */
    isEditMode = signal(false);

    course = signal<Course>(newCourse());
    holeCount = signal<9 | 18>(18);
    scanning = signal(false);
    scanError = signal('');
    saving = signal(false);

    nearbyCourses = signal<OverpassCourse[]>([]);
    nearbyError = signal('');
    showNearby = signal(false);
    searchQuery = signal('');
    searching = signal(false);
    loadingHoles = signal(false);
    holesFromOsm = signal<OsmHole[]>([]);

    canSave = computed(() => this.course().name.trim().length >= 2);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const existing = this.coursesService.getById(id);
            if (existing) {
                this.isEditMode.set(true);
                this.course.set(existing);
                this.holeCount.set(existing.holes.length >= 18 ? 18 : 9);
            } else {
                this.router.navigate(['/app/courses']);
            }
        }
    }

    setHoleCount(n: 9 | 18): void {
        this.holeCount.set(n);
        this.course.update(c => ({
            ...c,
            holes: Array.from({ length: n }, (_, i) =>
                c.holes[i] ?? { number: i + 1, par: 4, handicap: i + 1, tees: [{ name: 'White', yards: 350 }] }
            )
        }));
    }

    updateName(val: string): void { this.course.update(c => ({ ...c, name: val })); }
    updateLocation(val: string): void { this.course.update(c => ({ ...c, location: val })); }
    updateRating(val: string): void { this.course.update(c => ({ ...c, rating: parseFloat(val) || 0 })); }
    updateSlope(val: string): void { this.course.update(c => ({ ...c, slope: parseInt(val) || 0 })); }

    updateHole(idx: number, field: keyof Hole, val: number | string): void {
        this.course.update(c => {
            const holes = c.holes.map((h, i) => {
                if (i !== idx) return h;
                const v = typeof val === 'number' ? val : (parseInt(val as string) || 0);
                return { ...h, [field]: v };
            });
            return { ...c, holes };
        });
    }

    updateYardage(idx: number, val: number | string): void {
        this.course.update(c => {
            const holes = c.holes.map((h, i) => {
                if (i !== idx) return h;
                const yards = typeof val === 'number' ? val : (parseInt(val as string) || 0);
                const tees = [{ name: 'White', yards }];
                return { ...h, tees };
            });
            return { ...c, holes };
        });
    }

    async onScanImage(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        this.scanning.set(true);
        this.scanError.set('');

        try {
            const base64 = await this.fileToBase64(file);
            const result = await this.bridge.scanScorecard(base64);
            if (result) {
                this.course.update(c => ({
                    ...c,
                    name: result.courseName || c.name,
                    holes: result.holes.map(h => ({
                        number: h.number,
                        par: h.par,
                        handicap: h.handicap,
                        tees: [{ name: 'White', yards: h.yardage }],
                    })),
                }));
                this.holeCount.set(result.holes.length >= 18 ? 18 : 9);
            } else {
                this.scanError.set('Scan is only available in the iOS app. Fill in manually.');
            }
        } catch {
            this.scanError.set('Could not read scorecard. Please fill in manually.');
        } finally {
            this.scanning.set(false);
        }
    }

    save(): void {
        if (!this.canSave()) return;
        this.saving.set(true);
        this.coursesService.save(this.course());
        this.analytics.track('course_save', {
            is_edit: this.isEditMode(),
            hole_count: this.course().holes.length,
        });
        this.toast.success(this.isEditMode() ? 'Course updated' : 'Course saved');
        this.router.navigate(this.isEditMode()
            ? ['/app/courses', this.course().id]
            : ['/app/courses']);
    }

    cancel(): void {
        this.router.navigate(this.isEditMode()
            ? ['/app/courses', this.course().id]
            : ['/app/courses']);
    }

    async searchCourses(): Promise<void> {
        if (!this.searchQuery().trim()) return;
        this.searching.set(true);
        this.nearbyError.set('');
        this.showNearby.set(true);
        try {
            const results = await this.golfApi.searchByName(this.searchQuery());
            this.nearbyCourses.set(results);
            if (results.length === 0) {
                this.nearbyError.set('No golf courses found. Try a different name.');
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Search failed.';
            this.nearbyError.set(msg);
            this.toast.error(msg, () => this.searchCourses());
        } finally {
            this.searching.set(false);
        }
    }

    /**
     * Standard par-72 18-hole template used when a course has no OSM hole data.
     * Par distribution: 10× par-4, 4× par-3, 4× par-5 = 72.
     * Handicap indices follow the conventional odd-front / even-back split.
     * Yardages are typical white-tee averages.
     */
    private defaultHoles(count: 9 | 18): { number: number; par: number; handicap: number; tees: { name: string; yards: number }[] }[] {
        const template = [
            { par: 4, hdcp: 9, yards: 380 },
            { par: 4, hdcp: 3, yards: 410 },
            { par: 3, hdcp: 17, yards: 175 },
            { par: 5, hdcp: 11, yards: 505 },
            { par: 4, hdcp: 7, yards: 370 },
            { par: 3, hdcp: 13, yards: 185 },
            { par: 4, hdcp: 1, yards: 395 },
            { par: 5, hdcp: 5, yards: 540 },
            { par: 4, hdcp: 15, yards: 360 },
            { par: 4, hdcp: 8, yards: 385 },
            { par: 4, hdcp: 2, yards: 420 },
            { par: 3, hdcp: 18, yards: 160 },
            { par: 5, hdcp: 6, yards: 515 },
            { par: 4, hdcp: 10, yards: 375 },
            { par: 3, hdcp: 16, yards: 190 },
            { par: 4, hdcp: 4, yards: 400 },
            { par: 5, hdcp: 12, yards: 530 },
            { par: 4, hdcp: 14, yards: 390 },
        ];
        return template.slice(0, count).map((t, i) => ({
            number: i + 1,
            par: t.par,
            handicap: t.hdcp,
            tees: [{ name: 'White', yards: t.yards }],
        }));
    }

    selectNearbyCourse(c: OverpassCourse): void {
        this.course.update(co => ({
            ...co,
            name: c.name,
            location: c.address ?? `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`,
            lat: c.lat,
            lon: c.lon,
        }));
        this.showNearby.set(false);
        this.nearbyCourses.set([]);
        this.searchQuery.set('');
        // Apply default par-72 template immediately so the table is populated
        // right away even before the OSM lookup completes.
        this.holeCount.set(18);
        this.course.update(co => ({ ...co, holes: this.defaultHoles(18) }));
        // Try to replace defaults with real OSM hole data.
        this.loadingHoles.set(true);
        this.holesFromOsm.set([]);
        this.golfApi.fetchHoles(c.lat, c.lon).then(osmHoles => {
            this.loadingHoles.set(false);
            if (osmHoles.length === 0) {
                // No OSM data — defaults are already applied, nothing more to do.
                return;
            }
            this.holesFromOsm.set(osmHoles);
            const count = osmHoles.length >= 18 ? 18 : 9 as 9 | 18;
            this.holeCount.set(count);
            const fallback = this.defaultHoles(count);
            this.course.update(co => ({
                ...co,
                holes: Array.from({ length: count }, (_, i) => {
                    const osm = osmHoles.find(h => h.number === i + 1);
                    const def = fallback[i];
                    return osm
                        ? { number: i + 1, par: osm.par, handicap: osm.handicap, tees: [{ name: 'White', yards: osm.yards }] }
                        : def;
                }),
            }));
        }).catch(() => {
            this.loadingHoles.set(false);
            this.toast.error('Could not load hole data — using par-72 defaults');
        });
    }

    dismissNearby(): void {
        this.showNearby.set(false);
        this.nearbyCourses.set([]);
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res((reader.result as string).split(',')[1]);
            reader.onerror = rej;
            reader.readAsDataURL(file);
        });
    }
}
