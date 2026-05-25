import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
    get<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? (JSON.parse(raw) as T) : fallback;
        } catch {
            return fallback;
        }
    }

    set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.warn('StorageService: write failed for', key);
        }
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }
}
