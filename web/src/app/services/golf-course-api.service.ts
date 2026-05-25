import { Injectable } from '@angular/core';

export interface OsmHole {
    number: number;
    par: number;
    handicap: number;
    yards: number;
}

export interface OverpassCourse {
    id: number;
    name: string;
    lat: number;
    lon: number;
    /** Straight-line distance in km from query point (0 for name-search results) */
    distanceKm: number;
    /** Human-readable address from Nominatim */
    address?: string;
    /** Hole data from OSM, if available. Populated by fetchHoles(). */
    holes?: OsmHole[];
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

@Injectable({ providedIn: 'root' })
export class GolfCourseApiService {

    /**
     * Fetch hole data from OSM for a course at the given coordinates.
     * Searches within 3 km for elements tagged golf=hole.
     * Returns an empty array if no hole data is mapped for this course.
     */
    private _holesAbort: AbortController | null = null;

    async fetchHoles(lat: number, lon: number): Promise<OsmHole[]> {
        this._holesAbort?.abort();
        this._holesAbort = new AbortController();

        const query = `
[out:json][timeout:15];
(
  way["golf"="hole"](around:3000,${lat},${lon});
  relation["golf"="hole"](around:3000,${lat},${lon});
);
out tags center;`.trim();

        const res = await fetch(OVERPASS_URL, {
            method: 'POST',
            body: query,
            headers: { 'Content-Type': 'text/plain' },
            signal: this._holesAbort.signal,
        });

        if (!res.ok) return [];

        const data = await res.json() as {
            elements: {
                tags?: {
                    ref?: string;
                    name?: string;
                    par?: string;
                    handicap?: string;
                    length?: string;
                    'length:yards'?: string;
                };
            }[];
        };

        const holes: OsmHole[] = [];
        for (const e of data.elements) {
            const tags = e.tags ?? {};
            // ref tag is the hole number; fall back to stripping non-digits from name
            const num = parseInt(tags.ref ?? '') ||
                parseInt((tags.name ?? '').replace(/\D/g, ''));
            if (!num || num < 1 || num > 18) continue;

            const yardsTag = parseFloat(tags['length:yards'] ?? '0');
            const meters = parseFloat(tags.length ?? '0');
            // Prefer explicit yards tag; otherwise convert meters → yards
            const yards = yardsTag > 0 ? Math.round(yardsTag) :
                meters > 0 ? Math.round(meters * 1.09361) : 0;

            holes.push({
                number: num,
                par: parseInt(tags.par ?? '4') || 4,
                handicap: parseInt(tags.handicap ?? String(num)) || num,
                yards,
            });
        }

        return holes.sort((a, b) => a.number - b.number);
    }

    /**
     * Search for golf courses by name using Nominatim (OSM geocoding).
     * Free, no API key required.
     */
    private _searchAbort: AbortController | null = null;

    async searchByName(query: string): Promise<OverpassCourse[]> {
        if (!query.trim()) return [];
        // Abort any in-flight search request so stale responses don't overwrite newer ones.
        this._searchAbort?.abort();
        this._searchAbort = new AbortController();

        const params = new URLSearchParams({
            format: 'json',
            q: `${query.trim()} golf course`,
            limit: '20',
            addressdetails: '1',
        });

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'CarnivoreGolfApp/1.0' },
            signal: this._searchAbort.signal,
        });

        if (!res.ok) throw new Error(`Nominatim error ${res.status}`);

        const data = await res.json() as {
            place_id: number;
            display_name: string;
            lat: string;
            lon: string;
            type: string;
        }[];

        const results = data
            .filter(e => e.type === 'golf_course' || e.display_name.toLowerCase().includes('golf'))
            .map(e => {
                const parts = e.display_name.split(',');
                const name = parts[0].trim();
                const address = parts.slice(1, 4).map(p => p.trim()).filter(Boolean).join(', ');
                return {
                    id: e.place_id,
                    name,
                    lat: parseFloat(e.lat),
                    lon: parseFloat(e.lon),
                    distanceKm: 0,
                    address,
                };
            })
            .slice(0, 15);
        return results;
    }
}
