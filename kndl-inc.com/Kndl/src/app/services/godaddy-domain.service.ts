import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DomainAvailabilityResult {
    domain: string;
    available: boolean;
    price?: number;
    currency?: string;
}

export interface GoDaddyDomainCheck {
    domain: string;
    available: boolean;
    definitive: boolean;
    price?: number;
    currency?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GodaddyDomainService {
    private readonly baseUrl = environment.godaddy?.baseUrl || 'https://api.ote-godaddy.com/v1';
    private readonly apiKey = environment.godaddy?.apiKey || 'YOUR_GODADDY_API_KEY';
    private readonly apiSecret = environment.godaddy?.apiSecret || 'YOUR_GODADDY_API_SECRET';

    // Note: For production, these should be stored in environment variables
    // and the API calls should go through your backend to avoid CORS issues
    private readonly corsProxy = 'https://api.allorigins.win/raw?url=';

    // Configuration flags
    private useSimulationMode = true; // Set to false to try real API

    constructor(private http: HttpClient) { }

    /**
     * Enable real API mode (for testing when API is fixed)
     */
    enableApiMode() {
        this.useSimulationMode = false;
        console.log('🔄 Switched to real GoDaddy API mode');
    }

    /**
     * Enable simulation mode (recommended for development)
     */
    enableSimulationMode() {
        this.useSimulationMode = true;
        console.log('🎭 Switched to simulation mode');
    }

    /**
     * Get current mode
     */
    getCurrentMode(): 'simulation' | 'api' {
        return this.useSimulationMode ? 'simulation' : 'api';
    }

    /**
     * Check domain availability using GoDaddy API
     * Note: This is a simplified implementation. In production, you should:
     * 1. Store API credentials securely in environment variables
     * 2. Make API calls from your backend to avoid CORS and credential exposure
     * 3. Implement proper error handling and rate limiting
     */
    checkDomainAvailability(domains: string[]): Observable<DomainAvailabilityResult[]> {
        console.log('Checking domain availability for:', domains);
        console.log('API Key configured:', !!this.apiKey && this.apiKey !== 'YOUR_GODADDY_API_KEY');
        console.log('Environment:', environment.production ? 'Production' : 'Development');
        console.log('Current mode:', this.getCurrentMode());

        // Use simulation mode if enabled or if API credentials are not properly configured
        if (this.useSimulationMode || !this.apiKey || this.apiKey === 'YOUR_GODADDY_API_KEY' || !environment.godaddy?.apiKey) {
            console.log('Using simulation mode');
            return this.simulateDomainCheck(domains);
        }

        // Real API mode
        console.log('Using real GoDaddy API');
        return this.makeRealApiCall(domains);
    }

    /**
     * Make real API call to GoDaddy
     */
    private makeRealApiCall(domains: string[]): Observable<DomainAvailabilityResult[]> {
        // Use proxy in development to avoid CORS
        const isDevelopment = !environment.production;
        let url: string;
        let headers: HttpHeaders;

        if (isDevelopment) {
            // Use Angular proxy
            url = '/api/godaddy/domains/available';
            headers = new HttpHeaders({
                'Content-Type': 'application/json'
                // Authorization is handled by proxy
            });
        } else {
            // Production: This should go through your backend API
            url = `${this.baseUrl}/domains/available`;
            headers = new HttpHeaders({
                'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
                'Content-Type': 'application/json'
            });
        }

        console.log('Making API request to:', url);
        return this.http.post<GoDaddyDomainCheck[]>(url, domains, { headers }).pipe(
            map(results => results.map(result => ({
                domain: result.domain,
                available: result.available,
                price: result.price,
                currency: result.currency || 'USD'
            }))),
            catchError(error => {
                console.warn('GoDaddy API error, falling back to simulation:', error);
                return this.simulateDomainCheck(domains);
            })
        );
    }

    /**
     * Test API connection to diagnose issues
     */
    testApiConnection(): Observable<any> {
        console.log('Testing GoDaddy API connection...');

        if (!this.apiKey || this.apiKey === 'YOUR_GODADDY_API_KEY') {
            return throwError(() => new Error('No API credentials configured'));
        }

        // Try a simple API call first
        const headers = new HttpHeaders({
            'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
            'Content-Type': 'application/json'
        });

        // Test with a simple domain check
        const testDomain = ['example.com'];
        const url = '/api/godaddy/domains/available';

        return this.http.post(url, testDomain, { headers }).pipe(
            map(response => {
                console.log('API test successful:', response);
                return response;
            }),
            catchError(error => {
                console.error('API test failed:', error);
                if (error.status === 403) {
                    console.error('403 Forbidden - Possible causes:');
                    console.error('1. Invalid API credentials');
                    console.error('2. API key doesn\'t have domain permissions');
                    console.error('3. Using production API with OTE credentials (or vice versa)');
                    console.error('4. Rate limiting');
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Simulate domain availability check for development/demo purposes
     */
    private simulateDomainCheck(domains: string[]): Observable<DomainAvailabilityResult[]> {
        // Add a small delay to simulate network request
        return new Observable(observer => {
            setTimeout(() => {
                const results = domains.map(domain => {
                    // Simulate realistic availability based on domain patterns
                    const isAvailable = this.simulateAvailability(domain);
                    const price = this.getSimulatedPrice(domain);

                    return {
                        domain,
                        available: isAvailable,
                        price,
                        currency: 'USD'
                    };
                });

                observer.next(results);
                observer.complete();
            }, 800); // 800ms delay to simulate API call
        });
    }

    /**
     * Simulate domain availability based on realistic patterns
     */
    private simulateAvailability(domain: string): boolean {
        const tld = domain.split('.').pop()?.toLowerCase();
        const name = domain.split('.')[0].toLowerCase();

        // Specific domains that should always be available for demo purposes
        const alwaysAvailable = [
            'kendallryanlewis', 'pixelandpost', 'mycompany', 'mybusiness',
            'mystartup', 'myshop', 'mystore', 'brandnew'
        ];
        if (alwaysAvailable.some(word => name.includes(word))) {
            return true; // Demo domains should be available
        }

        // Common domains are usually taken
        const commonWords = ['google', 'facebook', 'apple', 'microsoft', 'amazon', 'business', 'company', 'shop', 'store'];
        if (commonWords.some(word => name.includes(word))) {
            return false;
        }

        // Very short domains are usually taken
        if (name.length <= 3) {
            return Math.random() < 0.1; // 10% chance of being available
        }

        // Short domains are competitive
        if (name.length <= 6) {
            return Math.random() < 0.3; // 30% chance
        }

        // Medium length domains
        if (name.length <= 10) {
            return tld === 'com' ? Math.random() < 0.5 : Math.random() < 0.7;
        }

        // Longer, more specific domains are more likely available
        return Math.random() < 0.85; // 85% chance for long domains
    }

    /**
     * Get simulated pricing based on TLD and domain characteristics
     */
    private getSimulatedPrice(domain: string): number {
        const tld = domain.split('.').pop()?.toLowerCase();
        const name = domain.split('.')[0].toLowerCase();

        let basePrice: number;

        // Base pricing by TLD
        switch (tld) {
            case 'com':
                basePrice = 12.99;
                break;
            case 'net':
                basePrice = 13.99;
                break;
            case 'org':
                basePrice = 13.99;
                break;
            case 'io':
                basePrice = 39.99;
                break;
            case 'dev':
                basePrice = 12.99;
                break;
            case 'tech':
                basePrice = 19.99;
                break;
            case 'design':
                basePrice = 39.99;
                break;
            case 'studio':
                basePrice = 24.99;
                break;
            case 'app':
                basePrice = 19.99;
                break;
            default:
                basePrice = 15.99;
        }

        // Premium pricing for short domains
        if (name.length <= 3 && tld === 'com') {
            basePrice = Math.max(basePrice, 99.99);
        } else if (name.length <= 5 && tld === 'com') {
            basePrice = Math.max(basePrice, 29.99);
        }

        // Premium pricing for certain keywords
        const premiumKeywords = ['ai', 'crypto', 'nft', 'web3', 'cloud', 'app'];
        if (premiumKeywords.some(keyword => name.includes(keyword))) {
            basePrice = Math.max(basePrice * 1.5, 24.99);
        }

        return Math.round(basePrice * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Generate domain suggestions based on a search term
     */
    generateDomainSuggestions(searchTerm: string): string[] {
        const clean = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!clean) return [];

        const suggestions = [
            `${clean}.com`,
            `${clean}.net`,
            `${clean}.org`,
            `${clean}design.com`,
            `${clean}studio.com`,
            `my${clean}.com`,
            `the${clean}.com`,
            `get${clean}.com`,
            `${clean}app.com`,
            `${clean}.io`,
            `${clean}.dev`,
            `${clean}.tech`
        ];

        // Remove duplicates and limit to reasonable number
        return [...new Set(suggestions)].slice(0, 8);
    }
}
