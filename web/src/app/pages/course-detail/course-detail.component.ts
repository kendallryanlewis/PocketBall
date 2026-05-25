import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursesService } from '../../services/courses.service';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { GolfCourseApiService } from '../../services/golf-course-api.service';
import { ToastService } from '../../services/toast.service';
import { Course, coursePar } from '../../models/course.model';

@Component({
    selector: 'app-course-detail',
    imports: [RouterLink],
    templateUrl: './course-detail.component.html',
    styleUrl: './course-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private sanitizer = inject(DomSanitizer);
    private coursesService = inject(CoursesService);
    private weatherSvc = inject(WeatherService);
    private golfApi = inject(GolfCourseApiService);
    private toast = inject(ToastService);

    course = signal<Course | null>(null);
    weather = signal<WeatherData | null>(null);
    weatherLoading = signal(false);
    weatherError = signal('');
    coords = signal<{ lat: number; lon: number } | null>(null);
    safeMapUrl = signal<SafeResourceUrl | null>(null);

    par = coursePar;
    front9Par = (c: Course) => c.holes.slice(0, 9).reduce((s, h) => s + h.par, 0);
    back9Par = (c: Course) => c.holes.slice(9).reduce((s, h) => s + h.par, 0);
    yardSum = (s: number, h: { tees: { yards: number }[] }) => s + (h.tees[0]?.yards ?? 0);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        const c = this.coursesService.getById(id);
        if (!c) { this.router.navigate(['/app/courses']); return; }
        this.course.set(c);
        this.resolveCoords(c);
    }

    private async resolveCoords(c: Course): Promise<void> {
        // 1. Use stored lat/lon if available (set when picking from OSM)
        if (c.lat != null && c.lon != null) {
            this.setCoords(c.lat, c.lon);
            return;
        }
        // 2. Parse "lat, lon" format stored as fallback location string
        const m = c.location.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
        if (m) {
            this.setCoords(parseFloat(m[1]), parseFloat(m[2]));
            return;
        }
        // 3. Geocode the location string via Nominatim
        if (c.location.trim()) {
            try {
                const results = await this.golfApi.searchByName(c.name + ' ' + c.location);
                if (results.length > 0) this.setCoords(results[0].lat, results[0].lon);
            } catch { /* no map/weather without coords */ }
        }
    }

    private setCoords(lat: number, lon: number): void {
        this.coords.set({ lat, lon });
        const d = 0.012;
        const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d},${lat - d},${lon + d},${lat + d}&layer=mapnik&marker=${lat},${lon}`;
        this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.weatherLoading.set(true);
        this.weatherSvc.getWeather(lat, lon)
            .then(w => { this.weather.set(w); this.weatherLoading.set(false); })
            .catch(() => {
                this.weatherLoading.set(false);
                this.weatherError.set('Weather unavailable');
                this.toast.error('Could not load weather', () => {
                    this.weatherError.set('');
                    this.setCoords(lat, lon);
                });
            });
    }

    editCourse(): void {
        const c = this.course();
        if (c) this.router.navigate(['/app/courses', c.id, 'edit']);
    }
}
