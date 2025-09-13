import { Component, OnInit } from '@angular/core';

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  timeline: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  recurring: boolean; // true for monthly, false for one-time
}

export interface OrderSummary {
  selectedPackage: Package | null;
  selectedAddOns: AddOn[];
  oneTimeTotal: number;
  monthlyTotal: number;
}

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 5;

  selectedPackage: Package | null = null;
  selectedAddOns: AddOn[] = [];

  // Domain properties
  domainOption: 'allowus' | 'existing' | null = null;
  newDomainName: string = '';
  existingDomainName: string = '';
  domainCheckResult: { available: boolean; message: string } | null = null;

  packages: Package[] = [
    {
      id: 'starter',
      name: 'Starter — Brand Essentials',
      price: 425,
      description: 'Perfect for new businesses establishing online presence',
      features: [
        'Logo refresh (polished update of existing logo)',
        '1–2 social media profiles (setup & branding)',
        'One-page SEO-friendly website (WordPress/Wix)',
        'Business card design + mini brand guide',
        'Google Business profile optimization',
        'SEO homepage copy (keyword-ready)',
        '1 month starter social posts (4–6 templates)'
      ],
      timeline: '2-3 weeks'
    },
    {
      id: 'growth',
      name: 'Growth — Digital + Print',
      price: 1150,
      description: 'For businesses ready to build consistent organic reach',
      features: [
        'Full brand kit (logos, color palette, fonts, usage guide)',
        '3–4 social profiles (setup with branded banners & highlights)',
        'Multi-page website (WordPress/Wix or light Angular)',
        'Print materials (business cards + flyers/postcards)',
        '1 month of social media content templates',
        'On-page SEO optimization across all site pages',
        '1 blog post or promotional video (SEO-enhanced)'
      ],
      timeline: '4-6 weeks'
    },
    {
      id: 'pro',
      name: 'Pro — Total Brand Presence',
      price: 2750,
      description: 'Scalable growth with measurable ROI and multi-channel dominance',
      features: [
        'Custom website (WordPress/Wix/Angular with backend)',
        'Full brand kit + professional collateral package',
        '3 months of social media content (ready-to-use templates)',
        'Advanced print materials (banners, signage, merchandise)',
        'Advanced SEO strategy (keyword ranking, backlinks, analysis)',
        'Email + SMS automation system setup',
        'Paid ad campaign framework (Google, Meta, retargeting)',
        'ROI dashboard + strategy consultation'
      ],
      timeline: '6-10 weeks'
    }
  ];

  addOns: AddOn[] = [
    // Monthly Management for Starter
    {
      id: 'starter-monthly',
      name: 'Starter Monthly Management',
      price: 225,
      description: 'Google Business updates, 4–6 social posts/month, basic analytics',
      recurring: true
    },
    // Monthly Management for Growth
    {
      id: 'growth-monthly',
      name: 'Growth Monthly Management',
      price: 550,
      description: '8–12 social posts/month, monthly blog/video, 2 ad campaigns, email setup',
      recurring: true
    },
    // Monthly Management for Pro
    {
      id: 'pro-monthly',
      name: 'Pro Monthly Management',
      price: 1750,
      description: 'Full social management, weekly content, paid ads, email/SMS campaigns, SEO reports',
      recurring: true
    },
    // Digital Growth Upsells
    {
      id: 'reputation-mgmt',
      name: 'Reputation Management',
      price: 200,
      description: 'Google/Yelp reviews management and monitoring',
      recurring: true
    },
    {
      id: 'local-seo',
      name: 'Local SEO Management',
      price: 450,
      description: 'Monthly local search optimization and ranking improvements',
      recurring: true
    },
    {
      id: 'retargeting-ads',
      name: 'Retargeting Ads Management',
      price: 350,
      description: 'Google + Meta pixel retargeting campaign management',
      recurring: true
    },
    // Creative & Brand Upsells
    {
      id: 'photography',
      name: 'Professional Photography',
      price: 600,
      description: 'Brand or product photoshoot session',
      recurring: false
    },
    {
      id: 'video-content',
      name: 'Video Ads/Reels',
      price: 525,
      description: 'Short-form branded video content creation',
      recurring: false
    },
    {
      id: 'landing-pages',
      name: 'Landing Pages & Funnels',
      price: 425,
      description: 'Sales or lead capture page design and development',
      recurring: false
    },
    // Passive Income Services
    {
      id: 'hosting-maintenance',
      name: 'Hosting & Maintenance',
      price: 35,
      description: 'Website hosting, updates, backups, and monitoring',
      recurring: true
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      price: 200,
      description: 'Custom analytics dashboard with monthly reporting',
      recurring: true
    }
  ];

  ngOnInit() {
  }

  onPackageSelected(packageId: string) {
    this.selectedPackage = this.packages.find(p => p.id === packageId) || null;
  }

  onAddOnToggled(addOn: AddOn) {
    const index = this.selectedAddOns.findIndex(a => a.id === addOn.id);
    if (index > -1) {
      this.selectedAddOns.splice(index, 1);
    } else {
      this.selectedAddOns.push(addOn);
    }
  }

  isAddOnSelected(addOnId: string): boolean {
    return this.selectedAddOns.some(a => a.id === addOnId);
  }

  // Add-on categorization methods
  getMonthlyManagementAddOns(): AddOn[] {
    return this.addOns.filter(a =>
      a.id.includes('monthly') || a.id === 'hosting-maintenance' || a.id === 'analytics-dashboard'
    );
  }

  getDigitalGrowthAddOns(): AddOn[] {
    return this.addOns.filter(a =>
      ['reputation-mgmt', 'local-seo', 'retargeting-ads'].includes(a.id)
    );
  }

  getCreativeAddOns(): AddOn[] {
    return this.addOns.filter(a =>
      ['photography', 'video-content', 'landing-pages'].includes(a.id)
    );
  }

  getOrderSummary(): OrderSummary {
    const oneTimeAddOns = this.selectedAddOns.filter(a => !a.recurring);
    const monthlyAddOns = this.selectedAddOns.filter(a => a.recurring);

    // Add domain costs
    const domainOneTimeCost = this.getDomainSetupCost();
    const domainMonthlyCost = this.getDomainMonthlyCost();

    return {
      selectedPackage: this.selectedPackage,
      selectedAddOns: this.selectedAddOns,
      oneTimeTotal: (this.selectedPackage?.price || 0) +
        oneTimeAddOns.reduce((sum, a) => sum + a.price, 0) +
        domainOneTimeCost,
      monthlyTotal: monthlyAddOns.reduce((sum, a) => sum + a.price, 0) +
        domainMonthlyCost
    };
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  onProjectStarted() {
    this.nextStep();
  }

  // Domain methods
  onDomainOptionSelected(option: 'allowus' | 'existing') {
    this.domainOption = option;
    this.domainCheckResult = null;
  }

  checkDomainAvailability() {
    if (!this.newDomainName.trim()) {
      this.domainCheckResult = {
        available: false,
        message: 'Please enter a domain name'
      };
      return;
    }

    // Simulate domain check (replace with actual API call)
    setTimeout(() => {
      const random = Math.random();
      this.domainCheckResult = {
        available: random > 0.3, // 70% chance of being available
        message: random > 0.3
          ? `${this.getFullDomainName()} is available!`
          : `${this.getFullDomainName()} is already taken. Try a different name.`
      };
    }, 1000);
  }

  getFullDomainName(): string {
    return this.newDomainName || '';
  }

  isDomainSelectionValid(): boolean {
    switch (this.domainOption) {
      case 'allowus':
        return true;
      case 'existing':
        return this.existingDomainName.trim() !== '';
      default:
        return false;
    }
  }

  getTotalWithDomain(): number {
    const baseTotal = this.getOrderSummary().oneTimeTotal;
    return baseTotal; // Domain costs are now included in getOrderSummary()
  }

  // Domain cost calculation methods
  getDomainSetupCost(): number {
    if (this.domainOption === 'allowus') {
      return 275;
    }
    if (this.domainOption === 'existing') {
      return 100;
    }
    return 0;
  }

  getDomainMonthlyCost(): number {
    return 0;
  }

  getDomainYearlyCost(): number {
    return 0;
  }

  // Step checking methods to avoid template compilation issues
  isStep(step: number): boolean {
    return this.currentStep === step;
  }
}

