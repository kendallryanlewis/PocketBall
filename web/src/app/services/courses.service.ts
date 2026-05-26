import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Course, newCourse } from '../models/course.model';
import { getFirestoreDb } from '../firebase.config';

const KEY = 'cg_courses';

@Injectable({ providedIn: 'root' })
export class CoursesService {
    private storage = inject(StorageService);
    private auth = inject(AuthService);

    private _courses = signal<Course[]>(this.storage.get<Course[]>(KEY, []));

    readonly courses = this._courses.asReadonly();
    readonly count = computed(() => this._courses().length);

    constructor() {
        // When the signed-in user changes, pull their courses from Firestore.
        // On first login with no cloud data, local courses are migrated up.
        effect(() => {
            const userId = this.auth.user()?.userId;
            if (userId) this.syncFromFirestore(userId);
        });
    }

    private async syncFromFirestore(userId: string): Promise<void> {
        try {
            const db = getFirestoreDb();
            const snap = await getDocs(collection(db, 'users', userId, 'courses'));
            if (!snap.empty) {
                const courses = snap.docs.map(d => d.data() as Course)
                    .sort((a, b) => b.updatedAt - a.updatedAt);
                this._courses.set(courses);
                this.storage.set(KEY, courses);
            } else {
                // First login — migrate any local courses up to Firestore.
                for (const c of this._courses()) {
                    setDoc(doc(db, 'users', userId, 'courses', c.id), c).catch(() => {});
                }
            }
        } catch {
            // Offline or Firestore unavailable — localStorage data is already loaded.
        }
    }

    private fsWrite(course: Course): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        setDoc(doc(getFirestoreDb(), 'users', userId, 'courses', course.id), course)
            .catch(() => {});
    }

    private fsDelete(id: string): void {
        const userId = this.auth.user()?.userId;
        if (!userId) return;
        deleteDoc(doc(getFirestoreDb(), 'users', userId, 'courses', id))
            .catch(() => {});
    }

    getById(id: string): Course | undefined {
        return this._courses().find(c => c.id === id);
    }

    save(course: Course): void {
        const list = this._courses();
        const idx = list.findIndex(c => c.id === course.id);
        const saved = { ...course, updatedAt: Date.now() };
        const updated = idx >= 0
            ? list.map((c, i) => (i === idx ? saved : c))
            : [saved, ...list];
        this._courses.set(updated);
        this.storage.set(KEY, updated);
        this.fsWrite(saved);
    }

    delete(id: string): void {
        const updated = this._courses().filter(c => c.id !== id);
        this._courses.set(updated);
        this.storage.set(KEY, updated);
        this.fsDelete(id);
    }

    create(): Course {
        return newCourse();
    }
}
