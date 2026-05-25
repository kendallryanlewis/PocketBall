import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { coursePar } from '../../models/course.model';

@Component({
    selector: 'app-courses',
    imports: [RouterLink],
    templateUrl: './courses.component.html',
    styleUrl: './courses.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent {
    coursesService = inject(CoursesService);
    courses = this.coursesService.courses;
    deleting = signal<string | null>(null);
    par = coursePar;

    confirmDelete(id: string): void {
        this.deleting.set(id);
    }

    doDelete(): void {
        const id = this.deleting();
        if (id) this.coursesService.delete(id);
        this.deleting.set(null);
    }

    share(name: string, location: string): void {
        const text = `Check out ${name}${location ? ` in ${location}` : ''} on Carnivore Golf!`;
        if (navigator.share) {
            navigator.share({ text }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(text);
        }
    }
}
