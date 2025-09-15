import { TierType } from "./tier";

export interface Item {
    id: string;
    text: string;        // Short label
    scope: 'all' | TierType;
    done?: boolean;
}

export const onBoardingItems: Item[] = [
    // ----- Basics (all tiers) -----
    {
        id: 'welcome',
        text: 'Complete Introduction & Overview',
        scope: 'all'
    },
    {
        id: 'agreement',
        text: 'Finalize Agreement & Payment',
        scope: 'all'
    },
    {
        id: 'domain',
        text: 'Domain Selection & Access',
        scope: 'all'
    },
    {
        id: 'dns',
        text: 'DNS Setup',
        scope: 'all'
    },
    {
        id: 'hosting',
        text: 'Hosting & Platform Access',
        scope: 'all'
    },
    {
        id: 'assets',
        text: 'Brand Assets Uploaded',
        scope: 'all'
    },
    {
        id: 'analytics',
        text: 'Analytics & Tracking Setup',
        scope: 'all'
    },

    // ----- Starter -----
    {
        id: 'onepage',
        text: 'One-Page Website Content',
        scope: 'starter'
    },
    {
        id: 'starter-social',
        text: 'Social Profile Setup',
        scope: 'starter'
    },

    // ----- Growth -----
    {
        id: 'site-structure',
        text: 'Multi-Page Website Structure',
        scope: 'growth'
    },
    {
        id: 'brand-kit',
        text: 'Brand Kit Approval',
        scope: 'growth'
    },
    {
        id: 'print',
        text: 'Print Collateral Setup',
        scope: 'growth'
    },

    // ----- Pro -----
    {
        id: 'blog',
        text: 'Blog/News Setup',
        scope: 'pro'
    },
    {
        id: 'seo',
        text: 'Advanced SEO Baseline',
        scope: 'pro'
    },
    {
        id: 'email',
        text: 'Email Marketing & Newsletter',
        scope: 'pro'
    },
];
