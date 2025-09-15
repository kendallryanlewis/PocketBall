import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { TierFeature, TierPlan, TierType } from 'src/app/models/tier';

@Component({
  selector: 'app-ob-services',
  templateUrl: './on-boarding-services.component.html',
  styleUrls: ['./on-boarding-services.component.scss']
})

export class OnBoardingServicesComponent implements OnInit {
  selectedAddOns: string[] = [];
  selected: string = 'starter';
  selectedPackageName: string | null = null;
  selectedService: any;
  slectedPlanReview = '';
  selectAllOptions = false;
  declineOptions = false;
  @Output() selectedServiceChange = new EventEmitter<TierType>();

  hoveredCol: number | null = null;
  selectedCol: number | null = null;

  pixelPostPackages = [
    {
      name: 'Starter',
      tagline: 'Brand Essentials',
      price: '$250',
      purpose: 'For businesses just getting started with a brand presence.',
      includes: [
        'Basic logo design or logo refresh',
        '1–2 social media profile setups (Facebook, Instagram, or LinkedIn)',
        'One-page website (WordPress/Wix)',
        'Business card design (print-ready)',
        'Color palette & typography guide'
      ],
      optionalAddOns: [
        { label: 'Extra social media profiles', description: 'Add more platforms like Twitter, LinkedIn, or TikTok to your brand presence.', price: '$75' },
        { label: 'Basic SEO setup', description: 'Initial search engine optimization for your website and profiles.', price: '$100' },
        { label: 'Custom email setup', description: 'Professional email addresses using your domain.', price: '$50' },
        { label: 'Branded stationery', description: 'Letterhead, envelopes, and other print-ready business materials.', price: '$60' },
        { label: 'Google My Business setup', description: 'Get found locally with a verified Google business listing.', price: '$80' },
        { label: 'Simple landing page', description: 'A focused landing page for campaigns or lead capture.', price: '$120' }
      ]
    },
    {
      name: 'Growth',
      tagline: 'Digital + Print',
      price: '$800',
      purpose: 'For small businesses ready to market both online and offline.',
      includes: [
        'Full brand kit (logo variations, fonts, colors, usage guidelines)',
        '3–4 social media profile setups with banners & highlights',
        'Multi-page website (WordPress/Wix, or light Angular build if needed)',
        'Business cards + flyers or postcards (design + print-ready)',
        '1 month of social media content templates (editable)'
      ],
      optionalAddOns: [
        { label: 'Email marketing setup', description: 'Mailchimp, Constant Contact, or similar platform integration.', price: '$150' },
        { label: 'Basic analytics integration', description: 'Google Analytics or similar for tracking site performance.', price: '$90' },
        { label: 'Additional print collateral', description: 'Brochures, rack cards, or other marketing materials.', price: '$110' },
        { label: 'Blog setup', description: 'Add a blog to your website for content marketing.', price: '$130' },
        { label: 'Social ad creative', description: 'Custom graphics for Facebook, Instagram, or LinkedIn ads.', price: '$95' }
      ]
    },
    {
      name: 'Pro',
      tagline: 'Total Brand Presence',
      price: '$2,500',
      purpose: 'For businesses that want full, ongoing brand presence and support.',
      includes: [
        'Comprehensive brand system (logos, fonts, colors, usage)',
        'Custom website (WordPress/Wix/Angular with backend integrations)',
        'Social media kits across all major platforms',
        'Print + digital brand kit (business cards, brochures, signage, digital ads)',
        'Content & launch strategy support'
      ],
      optionalAddOns: [
        { label: 'Ongoing retainer', description: 'Monthly subscription for updates, campaigns, and support.', price: '$300/mo' },
        { label: 'Advanced SEO & analytics', description: 'Comprehensive search optimization and reporting.', price: '$250' },
        { label: 'Custom app or system development', description: 'Web or mobile app tailored to your business needs.', price: 'Custom Quote' },
        { label: 'Video content package', description: 'Short promo videos or explainers for your brand.', price: '$400' },
        { label: 'E-commerce integration', description: 'Online store setup and payment processing.', price: '$350' },
        { label: 'Brand photoshoot', description: 'Professional photography for your team, products, or location.', price: '$500' }
      ]
    }
  ];


  pixelPostPackagesSub = [
    {
      name: 'Starter',
      tagline: 'Brand Essentials',
      price: '$250 – $600 (one-time)',
      purpose: 'For businesses just getting started with a brand presence.',
      includes: [
        'Basic logo design or logo refresh',
        '1–2 social media profile setups (Facebook, Instagram, or LinkedIn)',
        'One-page website (WordPress/Wix)',
        'Business card design (print-ready)',
        'Color palette & typography guide'
      ],
      optionalAddOns: [
        'Extra social media profiles',
        'Basic SEO setup',
        'Custom email setup',
        'Branded stationery (letterhead, envelopes)'
      ]
      , selectedAddOns: [false, false, false, false]
    },
    {
      name: 'Growth',
      tagline: 'Digital + Print',
      price: '$800 – $1,500 (one-time)',
      purpose: 'For small businesses ready to market both online and offline.',
      includes: [
        'Full brand kit (logo variations, fonts, colors, usage guidelines)',
        '3–4 social media profile setups with banners & highlights',
        'Multi-page website (WordPress/Wix, or light Angular build if needed)',
        'Business cards + flyers or postcards (design + print-ready)',
        '1 month of social media content templates (editable)'
      ],
      optionalAddOns: [
        'Email marketing setup',
        'Basic analytics integration',
        'Additional print collateral'
      ]
      , selectedAddOns: [false, false, false]
    },
    {
      name: 'Pro',
      tagline: 'Total Brand Presence',
      price: '$2,500+ (one-time, scalable by project)',
      purpose: 'For businesses that want full, ongoing brand presence and support.',
      includes: [
        'Comprehensive brand system (logos, fonts, colors, usage)',
        'Custom website (WordPress/Wix/Angular with backend integrations)',
        'Social media kits across all major platforms',
        'Print + digital brand kit (business cards, brochures, signage, digital ads)',
        'Content & launch strategy support'
      ],
      optionalAddOns: [
        'Ongoing retainer (monthly subscription) for updates, campaigns, and support',
        'Advanced SEO & analytics',
        'Custom app or system development'
      ]
      , selectedAddOns: [false, false, false]
    }
  ];

  @Component({
    selector: 'app-ob-services',
    templateUrl: './on-boarding-services.component.html',
    styleUrls: ['./on-boarding-services.component.scss']
  })

  selectAllAddOns() {
    if (this.selectedService?.optionalAddOns) {
      this.selectedAddOns = this.selectedService.optionalAddOns.map((addon: any) => addon.label);
    }
  }

  deselectAllAddOns() {
    this.selectedAddOns = [];
  }

  onSelect(plan: TierPlan) {
    // TODO: hook to checkout/nav
    console.log('Selected plan:', plan);
  }

  ngOnInit() {
    this.selectPackage(this.selected);
  }

  selectPackage(plan: string) {
    this.selectedService = this.pixelPostPackages.find(pkg => pkg.name.toLowerCase() === plan.toLowerCase().trim());
    this.selectedAddOns = [];
  }

  toggleAddOn(addon: string) {
    const idx = this.selectedAddOns.indexOf(addon);
    if (idx > -1) {
      this.selectedAddOns.splice(idx, 1);
    } else {
      this.selectedAddOns.push(addon);
    }
  }
}
