import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Course, newCourse } from '../models/course.model';

const KEY = 'cg_courses';

@Injectable({ providedIn: 'root' })
export class CoursesService {
    private storage = inject(StorageService);
    private _courses = signal<Course[]>(this.storage.get<Course[]>(KEY, []));

    readonly courses = this._courses.asReadonly();
    readonly count = computed(() => this._courses().length);

    getById(id: string): Course | undefined {
        return this._courses().find(c => c.id === id);
    }

    save(course: Course): void {
        const list = this._courses();
        const idx = list.findIndex(c => c.id === course.id);
        const updated = idx >= 0
            ? list.map((c, i) => (i === idx ? { ...course, updatedAt: Date.now() } : c))
            : [{ ...course, updatedAt: Date.now() }, ...list];
        this._courses.set(updated);
        this.storage.set(KEY, updated);
    }

    delete(id: string): void {
        const updated = this._courses().filter(c => c.id !== id);
        this._courses.set(updated);
        this.storage.set(KEY, updated);
    }

    create(): Course {
        return newCourse();
    }
}
