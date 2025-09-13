import { Component, OnInit } from '@angular/core';
import { recurringAddons, oneTimeAddons, Addon } from '../kndl/addons.data';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-package-detail',
    templateUrl: './package-detail.component.html',
    styleUrls: ['./package-detail.component.scss']
})
export class PackageDetailComponent implements OnInit {
    packageData: any = null;
    packageIndex: number = 0;
    selectedAddOns: any[] = [];
    totalPrice: number = 0;
    basePrice: number = 0;

    // Package data structure with comprehensive details based on kndl-pricing
    packages = [
        {
            id: 'starter',
            name: 'Starter',
            tagline: 'Brand Essentials',
            heroTitle: 'GET STARTED FAST',
            heroSubtitle: 'For businesses just getting started with a brand presence. Logo refresh, one-page website, and Google Business setup to get you online fast.',
            description: 'For businesses just getting started with a brand presence.',
            detailedDescription: 'Perfect for solo entrepreneurs, local service providers, and small businesses who need a professional online presence without the complexity. Get a clean, modern website that showcases your services and makes it easy for customers to find and contact you.',
            price: '$325 – $780',
            originalPrice: '$1,200',
            timeline: '3-5 business days',
            revisions: '2 rounds included',
            video: 'assets/Video/foggy.mp4',
            icon: 'fa fa-rocket',
            color: '#364074',
            text: '#ffffff',
            includesTitle: 'Everything You Need to Launch',
            deliverables: [
                {
                    icon: 'fa fa-globe',
                    title: 'One-Page Website',
                    description: 'Clean, professional single-page website optimized for mobile and search engines',
                    details: ['Professional template customization', 'Mobile-responsive design', 'Contact form integration', 'Basic SEO setup', 'Fast loading speed']
                },
                {
                    icon: 'fa fa-share-alt',
                    title: 'Social Media Setup',
                    description: 'One social profile setup with basic optimization',
                    details: ['Profile creation & optimization', 'Basic profile setup', 'Bio optimization', 'Contact info setup', 'Account verification']
                },
                {
                    icon: 'fa fa-map-marker-alt',
                    title: 'Google Business Profile',
                    description: 'Complete setup and optimization for local search visibility',
                    details: ['Profile creation and verification', 'Business information optimization', 'Photo uploads', 'Basic local SEO', 'Review setup guidance']
                },
                {
                    icon: 'fa fa-search',
                    title: 'Basic SEO',
                    description: 'On-page SEO optimization to help customers find you online',
                    details: ['Meta tags optimization', 'Title tag setup', 'Basic keyword optimization', 'Site speed optimization', 'Google Analytics setup']
                }
            ],
            features: [
                '1 page website',
                '1 social profile setup',
                'SEO-friendly website',
                'Mobile responsive design',
                'Contact form included',
                'Google Business setup',
                'Basic analytics tracking',
                'Optional ads consultation'
            ],
            process: [
                { step: 1, title: 'Discovery Call', description: 'Quick consultation to understand your business and goals.', duration: '30 minutes' },
                { step: 2, title: 'Website Setup', description: 'Create your professional single-page website with contact form.', duration: '1-2 days' },
                { step: 3, title: 'Social & Google Setup', description: 'Set up your Google Business Profile and one social media account.', duration: '1 day' },
                { step: 4, title: 'SEO Optimization', description: 'Basic on-page SEO and Google Analytics setup.', duration: '1 day' },
                { step: 5, title: 'Launch', description: 'Final review, launch, and brief  on managing your new presence.', duration: '1 day' }
            ],
            // addOns removed; use shared add-ons instead
            portfolio: [
                { image: '', title: 'Local Plumber Website', category: 'Service Business', description: 'Simple one-page site with contact form and service areas' },
                { image: '', title: 'Personal Trainer Profile', category: 'Fitness', description: 'Clean website with booking info and testimonials' },
                { image: '', title: 'Hair Salon Online', category: 'Beauty', description: 'Professional site with hours, services, and contact' }
            ]
        },
        {
            id: 'growth',
            name: 'Growth',
            tagline: 'Digital + Print',
            heroTitle: 'GROW YOUR REACH',
            heroSubtitle: 'For small businesses ready to market online and offline. Full brand kit, multi-page website, and print materials to grow your visibility.',
            description: 'For small businesses ready to market online and offline.',
            detailedDescription: 'Perfect for businesses that have established their foundation and are ready to expand. Get a comprehensive digital presence with multiple pages, social profiles, and the tools you need to compete and grow in your market.',
            price: '$1,040 – $1,950',
            originalPrice: '$2,500',
            timeline: '5-7 business days',
            revisions: '3 rounds included',
            video: 'assets/Video/office.mp4',
            icon: 'fa fa-chart-line',
            color: '#197c65ff',
            text: '#ffffff',
            includesTitle: 'Complete Growth Infrastructure',
            deliverables: [
                {
                    icon: 'fa fa-globe',
                    title: 'Multi-Page Website',
                    description: 'Professional 3-5 page website with full navigation and content management',
                    details: ['Up to 5 custom pages', 'Professional template customization', 'Mobile-responsive design', 'Contact forms on multiple pages', 'Image galleries and content sections']
                },
                {
                    icon: 'fa fa-share-alt',
                    title: 'Multi-Platform Social Setup',
                    description: '2-3 social profiles with consistent branding and content',
                    details: ['2-3 social platform setup', 'Consistent branding across platforms', 'Profile optimization', 'Initial content creation', 'Cross-platform strategy']
                },
                {
                    icon: 'fa fa-search',
                    title: 'Advanced SEO',
                    description: 'Comprehensive on-page SEO optimization for better search rankings',
                    details: ['Keyword research and optimization', 'Meta tags and descriptions', 'Site structure optimization', 'Local SEO setup', 'Search console setup']
                },
                {
                    icon: 'fa fa-map-marker-alt',
                    title: 'Google Business Optimization',
                    description: 'Complete Google Business Profile optimization with ongoing strategy',
                    details: ['Full profile optimization', 'Photo and video uploads', 'Review management setup', 'Local citation building', 'Google Posts strategy']
                }
            ],
            features: [
                'Multi-page website (5 max)',
                '2-3 social profiles',
                'On-page SEO optimization',
                'Google Business optimization',
                'Professional contact forms',
                'Image galleries',
                'Mobile responsive design',
                'Analytics and tracking'
            ],
            process: [
                { step: 1, title: 'Strategy Session', description: 'Detailed consultation to plan your multi-platform presence.', duration: '1 hour' },
                { step: 2, title: 'Website Development', description: 'Build your multi-page website with all content and features.', duration: '3-4 days' },
                { step: 3, title: 'Social Media Setup', description: 'Create and optimize 2-3 social media profiles with consistent branding.', duration: '1-2 days' },
                { step: 4, title: 'SEO & Google Optimization', description: 'Advanced SEO setup and Google Business Profile optimization.', duration: '1-2 days' },
                { step: 5, title: 'Launch', description: 'Complete launch with  on managing your expanded presence.', duration: '1 day' }
            ],
            // addOns removed; use shared add-ons instead
            portfolio: [
                { image: '', title: 'Fitness Studio Complete', category: 'Health & Wellness', description: 'Multi-page site with class schedules and online booking' },
                { image: '', title: 'Restaurant Digital Presence', category: 'Food & Beverage', description: 'Website with menu, social media, and Google optimization' },
                { image: '', title: 'Consulting Firm Brand', category: 'Professional Services', description: 'Professional multi-page site with service pages and testimonials' }
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            tagline: 'Total Brand Presence',
            heroTitle: 'DOMINATE YOUR MARKET',
            heroSubtitle: 'For teams needing a custom site and a cohesive brand push. Custom website, full brand kit, and advanced SEO strategy for growing businesses.',
            description: 'For teams needing a custom site and a cohesive brand push.',
            detailedDescription: 'The complete solution for businesses ready to establish market dominance. Custom development, advanced integrations, comprehensive brand strategy, and ongoing support to ensure your business stands out and scales effectively.',
            price: '$2,600 – $4,550+',
            originalPrice: '$6,000+',
            timeline: '14-30 business days',
            revisions: 'Unlimited during development',
            video: 'assets/Video/city.mp4',
            icon: 'fa fa-crown',
            color: '#d2b48c',
            text: '#000000',
            includesTitle: 'Premium Business Solutions',
            deliverables: [
                {
                    icon: 'fa fa-code',
                    title: 'Custom Website Development',
                    description: 'Fully custom website with advanced functionality and integrations',
                    details: ['Custom design and development', 'Advanced functionality', 'Database integration', 'Custom forms and workflows', 'Performance optimization', 'Security hardening']
                },
                {
                    icon: 'fa fa-palette',
                    title: 'Complete Brand Kit',
                    description: 'Comprehensive brand identity with logos, colors, fonts, and guidelines',
                    details: ['Logo design and variations', 'Complete color palette', 'Typography system', 'Brand guidelines document', 'Marketing templates', 'Brand application examples']
                },
                {
                    icon: 'fa fa-envelope',
                    title: 'Email & SMS Automation',
                    description: 'Advanced marketing automation setup for customer engagement',
                    details: ['Email marketing platform setup', 'Automated email sequences', 'SMS marketing integration', 'Customer journey mapping', 'Analytics and reporting', 'A/B testing setup']
                },
                {
                    icon: 'fa fa-bullhorn',
                    title: 'Advanced Marketing Setup',
                    description: 'Google Ads, Facebook Ads, and comprehensive marketing strategy',
                    details: ['Google Ads account setup', 'Facebook/Instagram ads setup', 'Conversion tracking', 'Remarketing campaigns', 'Advanced analytics', 'Monthly strategy session']
                }
            ],
            features: [
                'Custom website development',
                'Complete brand kit',
                'Email + SMS automation setup',
                'Google Ads + Facebook Ads',
                'Advanced SEO strategy',
                'Custom integrations',
                'Ongoing support included',
                'Priority development queue'
            ],
            process: [
                { step: 1, title: 'Strategic Planning', description: 'Comprehensive business analysis and custom solution planning.', duration: '2-3 days' },
                { step: 2, title: 'Brand Development', description: 'Complete brand identity creation with multiple concepts and revisions.', duration: '3-4 days' },
                { step: 3, title: 'Custom Development', description: 'Build your custom website with advanced features and integrations.', duration: '14-30 days' },
                { step: 4, title: 'Marketing Integration', description: 'Set up all marketing automation, ads, and tracking systems.', duration: '2-3 days' },
                { step: 5, title: 'Launch & Optimization', description: 'Full launch with performance optimization and team .', duration: '1-2 days' }
            ],
            // addOns removed; use shared add-ons instead
            portfolio: [
                { image: '', title: 'Fitness Studio Complete', category: 'Health & Wellness', description: 'Multi-page site with class schedules and online booking' },
                { image: '', title: 'Restaurant Digital Presence', category: 'Food & Beverage', description: 'Website with menu, social media, and Google optimization' },
                { image: '', title: 'Consulting Firm Brand', category: 'Professional Services', description: 'Professional multi-page site with service pages and testimonials' }
            ]
            // addOns removed; use shared add-ons instead
        },
    ];

    // Expose shared add-ons for use in the template
    publicRecurringAddons = recurringAddons;
    publicOneTimeAddons = oneTimeAddons;

    constructor(private route: ActivatedRoute, private router: Router) { }

    toggleAddOn(addon: any): void {
        const index = this.selectedAddOns.findIndex(selected => selected.title === addon.title);
        if (index > -1) {
            this.selectedAddOns.splice(index, 1);
        } else {
            this.selectedAddOns.push(addon);
        }
        this.calculateTotal();
    }

    isAddOnSelected(addon: any): boolean {
        return this.selectedAddOns.some(selected => selected.title === addon.title);
    }

    calculateTotal(): void {
        let addonTotal = 0;
        this.selectedAddOns.forEach(addon => {
            // Extract numeric value from price string
            const price = addon.price.replace(/[^\d]/g, '');
            addonTotal += parseInt(price) || 0;
        });
        this.totalPrice = this.basePrice + addonTotal;
    }

    removeAddOn(addon: any): void {
        const index = this.selectedAddOns.findIndex(selected => selected.title === addon.title);
        if (index > -1) {
            this.selectedAddOns.splice(index, 1);
            this.calculateTotal();
        }
    }

    calculateSavings(originalPrice: string, currentPrice: string): number {
        const original = parseInt(originalPrice.replace(/[^\d]/g, ''));
        const current = parseInt(currentPrice.replace(/[^\d]/g, ''));
        return original - current;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const packageId = params['id'];

            // Check if it's a numeric index
            if (!isNaN(Number(packageId))) {
                this.packageIndex = parseInt(packageId);
                this.packageData = this.packages[this.packageIndex];
            } else {
                // Handle package name (starter, growth, pro)
                this.packageData = this.packages.find(pkg =>
                    pkg.id === packageId ||
                    pkg.name.toLowerCase() === packageId.toLowerCase()
                );
                this.packageIndex = this.packages.findIndex(pkg =>
                    pkg.id === packageId ||
                    pkg.name.toLowerCase() === packageId.toLowerCase()
                );
            }

            // Set base price based on package
            if (this.packageData) {
                const priceString = this.packageData.price.replace(/[^\d]/g, '');
                this.basePrice = parseInt(priceString) || 0;
                this.totalPrice = this.basePrice;
            }

            if (!this.packageData) {
                console.error('Package not found for ID:', packageId);
                this.router.navigate(['/']);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    hexToRgba(hex: string, alpha: number): string {
        // Remove the hash if it exists
        hex = hex.replace('#', '');

        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getGradientBackground(): string {
        return `linear-gradient(135deg, ${this.hexToRgba(this.packageData.color, 0.9)} 0%, ${this.hexToRgba(this.packageData.color, 0.7)} 100%)`;
    }

    getFeatureTitle(feature: string): string {
        // Extract the main title from feature strings
        return feature.split(':')[0] || feature;
    }

    getFeatureDescription(feature: string): string {
        // Extract description after colon, or return a generic description
        const parts = feature.split(':');
        return parts.length > 1 ? parts[1].trim() : 'Included in this package';
    }
}
