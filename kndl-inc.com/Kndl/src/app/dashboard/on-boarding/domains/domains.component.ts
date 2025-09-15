import { Component, OnInit } from '@angular/core';
import { GodaddyDomainService, DomainAvailabilityResult } from '../../../services/godaddy-domain.service';
import { MultiRegistrarDomainService, MultiRegistrarResult, RegistrarDomainResult } from '../../../services/multi-registrar-domain.service';
import { ComponentCommunicationService } from '../../../services/component-communication.service';

export interface DomainOption {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export interface DomainSetupStep {
  title: string;
  description: string;
  completed: boolean;
}

export interface DomainSuggestion {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
  tld?: string;
  description?: string;
  category?: string;
  renewalPrice?: number;
  features?: string[];
  purchaseUrl?: string;
  registrars?: DomainRegistrar[];
  multiRegistrarData?: MultiRegistrarResult;
}

export interface DomainRegistrar {
  name: string;
  price: number;
  url: string;
  rating: number;
  features: string[];
}

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss', '../../dashboard.component.scss']
})
export class DomainsComponent implements OnInit {
  currentStep: number = 1;
  selectedOption: DomainOption | null = null;
  selectedDomain: DomainSuggestion | null = null;
  domainName: string = '';
  domainSuggestions: DomainSuggestion[] = [];
  isSearching: boolean = false;
  searchError: string = '';
  businessName: string = '';

  constructor(
    private godaddyService: GodaddyDomainService,
    private multiRegistrarService: MultiRegistrarDomainService,
    private communicationService: ComponentCommunicationService
  ) { }

  domainOptions: DomainOption[] = [
    {
      id: 'self-service',
      title: 'Search & Purchase Domain',
      description: 'We recommend GoDaddy, Namecheap, or Google Domains for their user-friendly interface and competitive pricing.',
      price: 15.99,
      features: [
        'Detailed setup instructions',
        'DNS configuration guide',
        'Email forwarding help',
        'Free technical support'
      ]
    },
    {
      id: 'pixel-post-managed',
      title: 'Let Pixel & Post Handle It',
      description: 'We\'ll purchase, set up, and manage your domain for you',
      price: 75,
      features: [
        'Domain purchase included',
        'Complete DNS setup',
        'Email forwarding configuration',
        'Annual renewal management',
        'Priority technical support'
      ],
      recommended: true
    }
  ];

  selfPurchaseSteps: DomainSetupStep[] = [
    {
      title: 'Choose a Domain Registrar',
      description: 'We recommend Namecheap or Google Domains for their user-friendly interface and competitive pricing.',
      completed: false
    },
    {
      title: 'Search and Purchase Your Domain',
      description: 'Search for your desired domain name and complete the purchase. Expect to pay $10-15/year for a .com domain.',
      completed: false
    },
    {
      title: 'Configure DNS Settings',
      description: 'Point your domain to our hosting servers. We\'ll provide you with the exact DNS records to add.',
      completed: false
    },
    {
      title: 'Verify Domain Connection',
      description: 'We\'ll test your domain to ensure it\'s properly connected and ready for your website.',
      completed: false
    }
  ];

  ngOnInit() {
    // Try to get business name from local storage or previous onboarding steps
    this.businessName = this.getBusinessNameFromContext();

    // Initialize domain name input with business name
    if (this.businessName) {
      this.domainName = this.businessName;
    }

    // Generate initial domain suggestions
    this.generateInitialSuggestions();
  }

  /**
   * Get business name from onboarding context or user data
   */
  private getBusinessNameFromContext(): string {
    // First try the communication service
    const onboardingData = this.communicationService.getOnboardingData();
    if (onboardingData.businessName) {
      return onboardingData.businessName;
    }

    // Try to get from localStorage as fallback
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.businessName) {
          return data.businessName;
        }
      } catch (e) {
        console.log('Could not parse onboarding data');
      }
    }

    // Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const businessFromUrl = urlParams.get('businessName');
    if (businessFromUrl) {
      return businessFromUrl;
    }

    // Default fallback
    return 'yourbusiness';
  }

  selectOption(option: DomainOption) {
    this.selectedOption = option;
    this.nextStep();
  }

  searchDomain() {
    if (!this.domainName.trim()) return;

    this.isSearching = true;
    this.searchError = '';

    // Generate domain suggestions using the new service
    const suggestions = this.multiRegistrarService.generateDomainSuggestions(this.domainName);

    // Check availability across multiple registrars
    this.multiRegistrarService.checkDomainAcrossRegistrars(suggestions).subscribe({
      next: (results: MultiRegistrarResult[]) => {
        console.log('Multi-registrar results:', results);
        this.domainSuggestions = results.map(result => this.convertMultiRegistrarResult(result));
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Domain search error:', error);
        this.searchError = 'Unable to check domain availability. Please try again.';
        this.isSearching = false;

        // Fallback to basic suggestions
        this.domainSuggestions = suggestions.map(domain => ({
          domain,
          available: true,
          price: 15.99,
          currency: 'USD',
          registrars: this.getRegistrarOptions(domain, 15.99)
        }));
      }
    });
  }

  generateInitialSuggestions() {
    if (!this.businessName || this.businessName === 'yourbusiness') {
      // Don't generate suggestions until we have a real business name
      this.domainSuggestions = [];
      return;
    }

    // Generate suggestions based on actual business name using new service
    const suggestions = this.multiRegistrarService.generateDomainSuggestions(this.businessName);

    // Check availability for initial suggestions across multiple registrars
    this.multiRegistrarService.checkDomainAcrossRegistrars(suggestions).subscribe({
      next: (results: MultiRegistrarResult[]) => {
        this.domainSuggestions = results.map(result => this.convertMultiRegistrarResult(result));

        // Check if we have a previously selected domain
        const onboardingData = this.getOnboardingData();
        if (onboardingData.selectedDomain) {
          const previousSelection = this.domainSuggestions.find(
            s => s.domain === onboardingData.selectedDomain.domain
          );
          if (previousSelection) {
            this.selectedDomain = previousSelection;
          }
        }
      },
      error: (error) => {
        console.error('Initial suggestions error:', error);
        // Fallback to basic suggestions
        this.domainSuggestions = suggestions.map(domain => ({
          domain,
          available: true,
          price: 15.99,
          currency: 'USD',
          registrars: this.getRegistrarOptions(domain, 15.99)
        }));
      }
    });
  }

  selectDomain(suggestion: DomainSuggestion) {
    if (suggestion.available) {
      this.selectedDomain = suggestion;
      console.log('Selected domain:', suggestion);

      // Update through communication service
      this.communicationService.updateOnboardingData({
        domainSetup: {
          ...this.getOnboardingData().domainSetup,
          selectedDomain: suggestion
        }
      });

      // Provide user feedback
      this.showDomainSelectedFeedback(suggestion);
    }
  }

  /**
   * Show user feedback when domain is selected
   */
  private showDomainSelectedFeedback(domain: DomainSuggestion) {
    // You could show a toast notification or other feedback here
    // For now, we'll just log it, but you could integrate with a notification service
    console.log(`Domain ${domain.domain} selected successfully!`);
  }

  /**
   * Get onboarding data from the communication service
   */
  private getOnboardingData(): any {
    return this.communicationService.getOnboardingData();
  }

  /**
   * Check if a domain is currently selected
   */
  isDomainSelected(domain: string): boolean {
    return this.selectedDomain?.domain === domain;
  }

  toggleStepCompletion(index: number) {
    this.selfPurchaseSteps[index].completed = !this.selfPurchaseSteps[index].completed;
  }

  getCompletedSteps(): number {
    return this.selfPurchaseSteps.filter(step => step.completed).length;
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  proceedToNext() {
    // Update onboarding data through the communication service
    this.communicationService.updateOnboardingData({
      domainSetup: {
        selectedOption: this.selectedOption,
        selectedDomain: this.selectedDomain,
        completedSteps: this.getCompletedSteps(),
        totalSteps: this.selfPurchaseSteps.length
      }
    });

    const onboardingData = this.communicationService.getOnboardingData();
    console.log('Proceeding to next onboarding step with data:', onboardingData);

    // Emit event or navigate to next component
    // This could trigger navigation to the next onboarding step
    // You might want to use Router here to navigate to the next step

    // For now, let's just log the completion
    console.log('Domain setup completed:', {
      option: this.selectedOption?.title,
      domain: this.selectedDomain?.domain,
      progress: this.getDomainSetupSummary()
    });
  }

  /**
   * Validate domain name input
   */
  isDomainNameValid(): boolean {
    if (!this.domainName?.trim()) return false;

    // Basic domain name validation
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/;
    return domainPattern.test(this.domainName.trim());
  }

  /**
   * Get placeholder text for domain search
   */
  getDomainSearchPlaceholder(): string {
    return this.businessName && this.businessName !== 'yourbusiness'
      ? `Try "${this.businessName}" or enter a different name`
      : 'Enter your business or domain name';
  }

  /**
   * Clear search results and errors
   */
  clearSearch() {
    this.domainSuggestions = [];
    this.searchError = '';
    this.selectedDomain = null;
  }

  /**
   * Get summary of current domain setup
   */
  getDomainSetupSummary(): string {
    if (!this.selectedOption) return '';

    if (this.selectedOption.id === 'self-purchase') {
      const completed = this.getCompletedSteps();
      const total = this.selfPurchaseSteps.length;
      return `Self-setup: ${completed}/${total} steps completed`;
    } else {
      return 'Pixel & Post managed service selected';
    }
  }

  /**
   * Test method - set business name for demonstration
   * In a real app, this would come from previous onboarding steps
   */
  setTestBusinessName(name: string) {
    this.businessName = name;
    this.domainName = name;
    this.communicationService.setBusinessName(name);
    this.generateInitialSuggestions();
  }

  /**
   * Convert MultiRegistrarResult to DomainSuggestion format
   */
  private convertMultiRegistrarResult(result: MultiRegistrarResult): DomainSuggestion {
    const bestPrice = result.bestPrice;
    const recommended = result.recommended || result.bestPrice;
    const isAvailable = result.results.some(r => r.available);

    if (!isAvailable) {
      return {
        domain: result.domain,
        available: false,
        price: 0,
        currency: 'USD',
        multiRegistrarData: result
      };
    }

    return {
      domain: result.domain,
      available: true,
      price: bestPrice?.price || 15.99,
      currency: bestPrice?.currency || 'USD',
      renewalPrice: bestPrice?.renewalPrice,
      tld: this.extractTld(result.domain),
      description: this.getDomainInfo(this.extractTld(result.domain)).description,
      category: this.getDomainInfo(this.extractTld(result.domain)).category,
      features: recommended?.features || [],
      purchaseUrl: recommended?.purchaseUrl || this.getPurchaseUrl(result.domain),
      registrars: this.convertRegistrarResults(result.results),
      multiRegistrarData: result
    };
  }

  /**
   * Convert RegistrarDomainResult array to DomainRegistrar array
   */
  private convertRegistrarResults(registrarResults: RegistrarDomainResult[]): DomainRegistrar[] {
    return registrarResults
      .filter(r => r.available)
      .map(r => ({
        name: r.registrar,
        price: r.price,
        url: r.purchaseUrl,
        rating: r.rating,
        features: r.features || []
      }));
  }

  /**
   * Extract TLD from domain
   */
  private extractTld(domain: string): string {
    return domain.split('.').pop() || 'com';
  }

  /**
   * Get minimum price from multi-registrar data
   */
  getMinPrice(multiRegistrarData: MultiRegistrarResult): number {
    const availableResults = multiRegistrarData.results.filter(r => r.available);
    if (availableResults.length === 0) return 0;
    return Math.min(...availableResults.map(r => r.price));
  }

  /**
   * Get maximum price from multi-registrar data
   */
  getMaxPrice(multiRegistrarData: MultiRegistrarResult): number {
    const availableResults = multiRegistrarData.results.filter(r => r.available);
    if (availableResults.length === 0) return 0;
    return Math.max(...availableResults.map(r => r.price));
  }

  /**
   * Enhance domain result with additional information
   */
  private enhanceDomainResult(result: DomainAvailabilityResult): DomainSuggestion {
    const tld = result.domain.split('.').pop()?.toLowerCase() || '';
    const domainInfo = this.getDomainInfo(tld);

    return {
      domain: result.domain,
      available: result.available,
      price: result.price || 15.99,
      currency: result.currency || 'USD',
      tld: tld,
      description: domainInfo.description,
      category: domainInfo.category,
      renewalPrice: domainInfo.renewalPrice || result.price || 15.99,
      features: domainInfo.features,
      purchaseUrl: this.getPurchaseUrl(result.domain),
      registrars: this.getRegistrarOptions(result.domain, result.price || 15.99)
    };
  }

  /**
   * Get detailed information about a TLD
   */
  private getDomainInfo(tld: string) {
    const domainInfoMap: { [key: string]: any } = {
      'com': {
        description: 'Most popular and trusted domain extension',
        category: 'Commercial',
        renewalPrice: 13.99,
        features: ['Universal recognition', 'Best for businesses', 'SEO friendly', 'Global reach']
      },
      'net': {
        description: 'Great alternative to .com',
        category: 'Network',
        renewalPrice: 14.99,
        features: ['Tech-friendly', 'Network services', 'Professional', 'Global recognition']
      },
      'org': {
        description: 'Perfect for organizations and nonprofits',
        category: 'Organization',
        renewalPrice: 14.99,
        features: ['Trusted for nonprofits', 'Community focused', 'Professional', 'Established reputation']
      },
      'io': {
        description: 'Popular with tech startups',
        category: 'Technology',
        renewalPrice: 49.99,
        features: ['Tech industry standard', 'Startup favorite', 'Modern appeal', 'Developer community']
      },
      'dev': {
        description: 'Designed for developers',
        category: 'Development',
        renewalPrice: 15.99,
        features: ['Developer focused', 'Secure by default', 'Modern', 'Google-backed']
      },
      'tech': {
        description: 'Perfect for technology companies',
        category: 'Technology',
        renewalPrice: 22.99,
        features: ['Tech industry', 'Innovation focused', 'Modern', 'Professional']
      },
      'design': {
        description: 'Ideal for creative professionals',
        category: 'Creative',
        renewalPrice: 42.99,
        features: ['Creative industry', 'Portfolio sites', 'Professional', 'Design focused']
      },
      'studio': {
        description: 'Perfect for creative studios',
        category: 'Creative',
        renewalPrice: 27.99,
        features: ['Creative studios', 'Artistic projects', 'Professional', 'Memorable']
      }
    };

    return domainInfoMap[tld] || {
      description: 'Generic domain extension',
      category: 'Other',
      renewalPrice: 16.99,
      features: ['Unique choice', 'Available option', 'Affordable']
    };
  }

  /**
   * Generate purchase URL for a domain
   */
  private getPurchaseUrl(domain: string): string {
    // Default to GoDaddy since we're using their API for availability checking
    return `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`;
  }

  /**
   * Get registrar options for a domain
   */
  private getRegistrarOptions(domain: string, basePrice: number): DomainRegistrar[] {
    return [
      {
        name: 'GoDaddy',
        price: basePrice,
        url: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
        rating: 4.5,
        features: ['Industry leader', 'Easy setup', 'Domain tools', 'Website builder included']
      },
      {
        name: 'Namecheap',
        price: Math.max(basePrice - 1, 9.99),
        url: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
        rating: 4.8,
        features: ['Free WHOIS privacy', 'DNS management', 'Email forwarding', '24/7 support']
      },
      {
        name: 'Google Domains',
        price: basePrice + 1,
        url: `https://domains.google.com/registrar/search?searchTerm=${encodeURIComponent(domain)}`,
        rating: 4.7,
        features: ['Google integration', 'Simple management', 'Reliable DNS', 'Privacy included']
      },
      {
        name: 'Porkbun',
        price: Math.max(basePrice - 2, 8.99),
        url: `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
        rating: 4.9,
        features: ['Best prices', 'Free SSL', 'Free WHOIS privacy', 'Great support']
      },
      {
        name: 'Cloudflare',
        price: Math.max(basePrice - 1, 9.99),
        url: `https://www.cloudflare.com/products/registrar/`,
        rating: 4.6,
        features: ['At-cost pricing', 'Security focused', 'Fast DNS', 'Developer friendly']
      }
    ];
  }

  /**
   * Open purchase link for a domain
   */
  purchaseDomain(suggestion: DomainSuggestion, registrar?: DomainRegistrar) {
    const url = registrar?.url || suggestion.purchaseUrl;
    if (url) {
      // Log for tracking
      console.log(`Opening purchase link for ${suggestion.domain}`, {
        registrar: registrar?.name || 'Default',
        price: registrar?.price || suggestion.price
      });

      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
