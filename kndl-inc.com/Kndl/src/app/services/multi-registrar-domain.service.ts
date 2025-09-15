import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RegistrarDomainResult {
    registrar: string;
    domain: string;
    available: boolean;
    price: number;
    renewalPrice?: number;
    currency: string;
    features?: string[];
    purchaseUrl: string;
    rating: number;
}

export interface MultiRegistrarResult {
    domain: string;
    results: RegistrarDomainResult[];
    bestPrice?: RegistrarDomainResult;
    recommended?: RegistrarDomainResult;
}

@Injectable({
    providedIn: 'root'
})
export class MultiRegistrarDomainService {

    constructor(private http: HttpClient) { }

    /**
     * Check domain availability across multiple registrars
     */
    checkDomainAcrossRegistrars(domains: string[]): Observable<MultiRegistrarResult[]> {
        console.log('Checking domains across multiple registrars:', domains);

        // For now, we'll simulate the multi-registrar data
        // In a real implementation, you'd make actual API calls to each registrar
        return this.simulateMultiRegistrarCheck(domains);
    }

    /**
     * Simulate multi-registrar domain checking
     */
    private simulateMultiRegistrarCheck(domains: string[]): Observable<MultiRegistrarResult[]> {
        const results: MultiRegistrarResult[] = domains.map(domain => {
            const registrarResults: RegistrarDomainResult[] = this.generateRegistrarResults(domain);

            return {
                domain,
                results: registrarResults,
                bestPrice: this.findBestPrice(registrarResults),
                recommended: this.findRecommended(registrarResults)
            };
        });

        return of(results);
    }

    /**
     * Generate simulated results for each registrar
     */
    private generateRegistrarResults(domain: string): RegistrarDomainResult[] {
        const basePrice = this.getBasePriceForDomain(domain);
        const isAvailable = this.simulateAvailability(domain);

        return [
            {
                registrar: 'GoDaddy',
                domain,
                available: isAvailable,
                price: basePrice,
                renewalPrice: basePrice + 2,
                currency: 'USD',
                features: ['Industry leader', 'Easy setup', 'Website builder', '24/7 support'],
                purchaseUrl: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
                rating: 4.5
            },
            {
                registrar: 'Namecheap',
                domain,
                available: isAvailable,
                price: Math.max(basePrice - 1, 9.99),
                renewalPrice: basePrice + 1,
                currency: 'USD',
                features: ['Free WHOIS privacy', 'DNS management', 'Email forwarding', 'Great support'],
                purchaseUrl: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
                rating: 4.8
            },
            {
                registrar: 'Google Domains',
                domain,
                available: isAvailable,
                price: basePrice + 1,
                renewalPrice: basePrice + 1,
                currency: 'USD',
                features: ['Google integration', 'Simple management', 'Privacy included', 'Reliable'],
                purchaseUrl: `https://domains.google.com/registrar/search?searchTerm=${encodeURIComponent(domain)}`,
                rating: 4.7
            },
            {
                registrar: 'Porkbun',
                domain,
                available: isAvailable,
                price: Math.max(basePrice - 2, 8.99),
                renewalPrice: basePrice - 1,
                currency: 'USD',
                features: ['Best prices', 'Free SSL', 'Free WHOIS privacy', 'Excellent support'],
                purchaseUrl: `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
                rating: 4.9
            },
            {
                registrar: 'Cloudflare',
                domain,
                available: isAvailable,
                price: Math.max(basePrice - 1, 9.99),
                renewalPrice: basePrice - 1,
                currency: 'USD',
                features: ['At-cost pricing', 'Security focused', 'Fast DNS', 'Developer friendly'],
                purchaseUrl: `https://www.cloudflare.com/products/registrar/`,
                rating: 4.6
            }
        ];
    }

    /**
     * Get base price for a domain based on TLD
     */
    private getBasePriceForDomain(domain: string): number {
        const tld = domain.split('.').pop()?.toLowerCase();

        const pricing: { [key: string]: number } = {
            'com': 15.99,
            'net': 17.99,
            'org': 16.99,
            'io': 49.99,
            'dev': 18.99,
            'tech': 21.99,
            'app': 19.99,
            'co': 24.99,
            'ai': 89.99,
            'me': 22.99
        };

        return pricing[tld || 'com'] || 15.99;
    }

    /**
     * Simulate domain availability (some domains unavailable for realism)
     */
    private simulateAvailability(domain: string): boolean {
        const unavailableDomains = [
            'google.com',
            'facebook.com',
            'amazon.com',
            'microsoft.com',
            'apple.com'
        ];

        // Make some common words less likely to be available
        const commonWords = ['shop', 'store', 'buy', 'best', 'top', 'web'];
        const domainName = domain.split('.')[0].toLowerCase();

        if (unavailableDomains.includes(domain.toLowerCase())) {
            return false;
        }

        if (commonWords.some(word => domainName === word)) {
            return Math.random() > 0.7; // 30% chance of being available
        }

        if (domainName.length <= 4) {
            return Math.random() > 0.6; // 40% chance for short domains
        }

        return Math.random() > 0.2; // 80% chance for most domains
    }

    /**
     * Find the best price among registrar results
     */
    private findBestPrice(results: RegistrarDomainResult[]): RegistrarDomainResult | undefined {
        const availableResults = results.filter(r => r.available);
        if (availableResults.length === 0) return undefined;

        return availableResults.reduce((best, current) =>
            current.price < best.price ? current : best
        );
    }

    /**
     * Find the recommended registrar (balance of price, rating, and features)
     */
    private findRecommended(results: RegistrarDomainResult[]): RegistrarDomainResult | undefined {
        const availableResults = results.filter(r => r.available);
        if (availableResults.length === 0) return undefined;

        // Calculate score based on price (lower is better) and rating (higher is better)
        const scored = availableResults.map(result => ({
            ...result,
            score: (result.rating * 20) - result.price // Rating weight vs price
        }));

        return scored.reduce((best, current) =>
            current.score > best.score ? current : best
        );
    }

    /**
     * Generate domain suggestions with better variety
     */
    generateDomainSuggestions(searchTerm: string): string[] {
        const clean = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!clean) return [];

        const suggestions = [
            // Primary TLDs
            `${clean}.com`,
            `${clean}.net`,
            `${clean}.org`,

            // Modern TLDs
            `${clean}.io`,
            `${clean}.dev`,
            `${clean}.tech`,
            `${clean}.app`,

            // Creative variations
            `get${clean}.com`,
            `my${clean}.com`,
            `${clean}hq.com`,
            `${clean}pro.com`,
            `${clean}studio.com`,

            // Alternative TLDs
            `${clean}.co`,
            `${clean}.me`,
            `${clean}.ai`
        ];

        // Remove duplicates and limit results
        return [...new Set(suggestions)].slice(0, 12);
    }
}
