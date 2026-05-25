import { Injectable } from '@angular/core';

export interface WeatherData {
    temp: number;        // °F
    feelsLike: number;   // °F
    description: string; // "clear sky"
    wind: number;        // mph
    windDir: string;     // compass direction: N, NE, E…
    icon: string;        // OpenWeatherMap icon code
    humidity: number;    // %
}

// Free tier: https://openweathermap.org/api (1,000 calls/day, no credit card)
const OWM_KEY = 'a7e7b7e89f2869b320c728e4ad73fb66';

/** In-memory cache: keyed by "lat,lon" rounded to 2 dp. TTL: 10 minutes. */
const cache = new Map<string, { data: WeatherData; expires: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function toCompass(deg: number): string {
    return COMPASS[Math.round(deg / 45) % 8];
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
    private _abort: AbortController | null = null;

    /** Returns current weather at the given coordinates. Cached for 10 min. */
    async getWeather(lat: number, lon: number): Promise<WeatherData> {
        const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
        const hit = cache.get(key);
        if (hit && hit.expires > Date.now()) return hit.data;

        // Cancel any in-flight request before starting a new one
        this._abort?.abort();
        this._abort = new AbortController();

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=imperial`;
        const res = await fetch(url, { signal: this._abort.signal });
        if (!res.ok) throw new Error(`Weather API ${res.status}`);
        const d = await res.json() as {
            main: { temp: number; feels_like: number; humidity: number };
            weather: { description: string; icon: string }[];
            wind: { speed: number; deg: number };
        };
        const data: WeatherData = {
            temp: Math.round(d.main.temp),
            feelsLike: Math.round(d.main.feels_like),
            description: d.weather[0]?.description ?? '',
            wind: Math.round(d.wind.speed),
            windDir: toCompass(d.wind.deg),
            icon: d.weather[0]?.icon ?? '',
            humidity: d.main.humidity,
        };
        cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
        return data;
    }
}
