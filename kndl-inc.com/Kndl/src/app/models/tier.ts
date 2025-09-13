
export type TierType = 'starter' | 'growth' | 'pro';

export enum Tier {
    Starter = 'Starter',
    Professional = 'Professional',
    Enterprise = 'Enterprise'
}


export interface TierFeature {
    label: string;
    // true = ✓, false = ×, string = custom text like "Feature"
    values: (boolean | string)[];
}

export interface TierPlan {
    id: 'start' | 'pro' | 'business' | string;
    name: string;
    monthly: number;     // 0 for Free
    yearlyCharge?: number; // shown as "Charging $X per year"
    blurb?: string;      // e.g., "Next 3 months"
    ctaLabel?: string;
    popular?: boolean;
}