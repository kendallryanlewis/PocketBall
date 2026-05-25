export interface Tee {
    name: string;
    yards: number;
}

export interface Hole {
    number: number;
    par: number;
    handicap: number;
    tees: Tee[];
}

export interface Course {
    id: string;
    name: string;
    location: string;
    lat?: number;
    lon?: number;
    holes: Hole[];
    rating: number;
    slope: number;
    createdAt: number;
    updatedAt: number;
}

export function newCourse(overrides: Partial<Course> = {}): Course {
    const now = Date.now();
    return {
        id: crypto.randomUUID(),
        name: '',
        location: '',
        holes: Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: 4,
            handicap: i + 1,
            tees: [{ name: 'White', yards: 350 }],
        })),
        rating: 72.0,
        slope: 113,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

export function coursePar(course: Course): number {
    return course.holes.reduce((s, h) => s + h.par, 0);
}
