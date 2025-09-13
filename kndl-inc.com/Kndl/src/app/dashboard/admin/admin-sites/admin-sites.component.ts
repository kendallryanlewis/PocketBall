import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

interface Company {
  id: number;
  name: string;
  domain: string;
  logo?: string;
  contactEmail: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  subscriptionPlan: 'basic' | 'professional' | 'enterprise';
  monthlyAmount: number;
  userCount: number;
  lastBilling: Date;
  nextBilling: Date;
  createdDate: Date;
  billingCycle: 'monthly' | 'yearly';
  lastFourDigits: string;
  autoRenewal: boolean;
  monthlyPageViews: number;
  activeAddons: number[];
}

interface Addon {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  setupFee?: number;
  features: string[];
}

interface BillingRecord {
  id: number;
  date: Date;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  invoiceUrl?: string;
}

interface Activity {
  id: number;
  type: 'payment' | 'login' | 'update' | 'support';
  icon: string;
  description: string;
  date: Date;
}

@Component({
  selector: 'app-admin-sites',
  templateUrl: './admin-sites.component.html',
  styleUrls: ['./admin-sites.component.scss']
})
export class AdminSitesComponent implements OnInit {
  @Input() selectedTab: any = 'client-companies';
  @Output() selectedTabChange = new EventEmitter<any>();
  selectedCompany: Company | null = null;
  activeTab: string = 'overview';
  searchQuery: string = '';
  statusFilter: string = '';
  subscriptionFilter: string = '';
  showAddCompanyModal: boolean = false;

  // Filtered data
  filteredCompanies: Company[] = [];
  selectedAddons: Addon[] = [];

  // New company form
  newCompany: Partial<Company> = {
    subscriptionPlan: 'basic'
  };

  // Mock data
  companies: Company[] = [
    {
      id: 1,
      name: 'Acme Corporation',
      domain: 'acme.com',
      logo: 'https://via.placeholder.com/64x64?text=AC',
      contactEmail: 'admin@acme.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      subscriptionPlan: 'professional',
      monthlyAmount: 79,
      userCount: 25,
      lastBilling: new Date('2024-11-01'),
      nextBilling: new Date('2024-12-01'),
      createdDate: new Date('2024-01-15'),
      billingCycle: 'monthly',
      lastFourDigits: '4242',
      autoRenewal: true,
      monthlyPageViews: 15000,
      activeAddons: [1, 3]
    },
    {
      id: 2,
      name: 'TechStart Solutions',
      domain: 'techstart.io',
      contactEmail: 'contact@techstart.io',
      phone: '+1 (555) 987-6543',
      status: 'active',
      subscriptionPlan: 'basic',
      monthlyAmount: 29,
      userCount: 8,
      lastBilling: new Date('2024-10-28'),
      nextBilling: new Date('2024-11-28'),
      createdDate: new Date('2024-03-10'),
      billingCycle: 'monthly',
      lastFourDigits: '1234',
      autoRenewal: true,
      monthlyPageViews: 5000,
      activeAddons: []
    },
    {
      id: 3,
      name: 'Global Enterprises',
      domain: 'globalent.com',
      contactEmail: 'billing@globalent.com',
      phone: '+1 (555) 456-7890',
      status: 'suspended',
      subscriptionPlan: 'enterprise',
      monthlyAmount: 199,
      userCount: 150,
      lastBilling: new Date('2024-09-15'),
      nextBilling: new Date('2024-12-15'),
      createdDate: new Date('2023-08-20'),
      billingCycle: 'monthly',
      lastFourDigits: '5678',
      autoRenewal: false,
      monthlyPageViews: 50000,
      activeAddons: [1, 2, 4]
    }
  ];

  availableAddons: Addon[] = [
    {
      id: 1,
      name: 'Premium Support',
      description: '24/7 priority support with dedicated account manager',
      monthlyPrice: 25,
      features: ['24/7 Phone Support', 'Dedicated Account Manager', 'Priority Ticket Queue']
    },
    {
      id: 2,
      name: 'Advanced Analytics',
      description: 'Detailed traffic analytics and reporting dashboard',
      monthlyPrice: 15,
      setupFee: 50,
      features: ['Custom Reports', 'Real-time Analytics', 'Data Export']
    },
    {
      id: 3,
      name: 'SSL Certificate',
      description: 'Wildcard SSL certificate for enhanced security',
      monthlyPrice: 10,
      features: ['Wildcard SSL', 'Auto-renewal', 'Installation Support']
    },
    {
      id: 4,
      name: 'CDN Service',
      description: 'Global content delivery network for faster loading',
      monthlyPrice: 20,
      features: ['Global CDN', 'Image Optimization', 'Bandwidth Monitoring']
    }
  ];

  ngOnInit(): void {
    this.filteredCompanies = [...this.companies];
  }

  // Search and filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredCompanies = this.companies.filter(company => {
      const matchesSearch = !this.searchQuery ||
        company.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        company.domain.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        company.contactEmail.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || company.status === this.statusFilter;
      const matchesSubscription = !this.subscriptionFilter || company.subscriptionPlan === this.subscriptionFilter;

      return matchesSearch && matchesStatus && matchesSubscription;
    });
  }
  closeModal() {
    this.showAddCompanyModal = false;
    this.selectedTab = 'client-companies';
    this.selectedTabChange.emit(this.selectedTab);
  }

  // Company selection and management
  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.activeTab = 'overview';
    this.selectedAddons = [];
  }

  closeDetails(): void {
    this.selectedCompany = null;
    this.selectedTab = 'client-companies';
    this.selectedTabChange.emit(this.selectedTab);
  }

  // Utility methods
  getCompanyInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  getRelativeDate(date: Date): string {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return this.formatDate(date);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getMonthsActive(createdDate: Date): number {
    const months = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, months);
  }

  getTotalRevenue(company: Company): number {
    const monthsActive = this.getMonthsActive(company.createdDate);
    return company.monthlyAmount * monthsActive;
  }

  // Action methods
  viewSite(company: Company): void {
    window.open(`https://${company.domain}`, '_blank');
  }

  manageBilling(company: Company): void {
    this.selectCompany(company);
    this.activeTab = 'billing';
  }

  editCompany(company: Company): void {
    // Open edit modal or navigate to edit page
    const updatedInfo = prompt(`Edit company name (current: ${company.name}):`, company.name);
    if (updatedInfo && updatedInfo.trim() !== company.name) {
      company.name = updatedInfo.trim();
      console.log('Company updated:', company);

      // Show success message
      alert(`Company "${company.name}" has been updated successfully!`);
    }
  }

  // Overview tab methods
  getRecentActivity(company: Company): Activity[] {
    // Mock recent activity data
    return [
      {
        id: 1,
        type: 'payment',
        icon: 'fa fa-credit-card',
        description: `Payment of $${company.monthlyAmount} received`,
        date: company.lastBilling
      },
      {
        id: 2,
        type: 'login',
        icon: 'fa fa-sign-in-alt',
        description: 'Admin user logged in',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'update',
        icon: 'fa fa-edit',
        description: 'Website content updated',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  // Billing tab methods
  getTotalPaid(company: Company): number {
    return this.getTotalRevenue(company);
  }

  getOutstanding(company: Company): number {
    // Mock outstanding amount
    return company.status === 'suspended' ? company.monthlyAmount : 0;
  }

  getBillingHistory(company: Company): BillingRecord[] {
    const history: BillingRecord[] = [];
    const monthsActive = this.getMonthsActive(company.createdDate);

    for (let i = 0; i < Math.min(monthsActive, 12); i++) {
      const date = new Date(company.lastBilling);
      date.setMonth(date.getMonth() - i);

      history.push({
        id: i + 1,
        date: date,
        description: `Monthly subscription - ${company.subscriptionPlan} plan`,
        amount: company.monthlyAmount,
        status: i === 0 && company.status === 'suspended' ? 'failed' : 'paid'
      });
    }

    return history;
  }

  viewInvoice(bill: BillingRecord): void {
    // Simulate opening invoice in new tab
    const invoiceData = {
      id: bill.id,
      date: bill.date,
      amount: bill.amount,
      description: bill.description,
      status: bill.status
    };

    console.log('Opening invoice:', invoiceData);

    // Create a simple invoice display
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${bill.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .invoice-details { margin: 20px 0; }
              .status { padding: 5px 10px; border-radius: 5px; font-weight: bold; }
              .paid { background: #d4edda; color: #155724; }
              .pending { background: #fff3cd; color: #856404; }
              .failed { background: #f8d7da; color: #721c24; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Invoice #${bill.id}</h1>
              <p>Date: ${this.formatDate(bill.date)}</p>
            </div>
            <div class="invoice-details">
              <h3>Service Details</h3>
              <p><strong>Description:</strong> ${bill.description}</p>
              <p><strong>Amount:</strong> $${bill.amount}</p>
              <p><strong>Status:</strong> 
                <span class="status ${bill.status}">${bill.status.toUpperCase()}</span>
              </p>
            </div>
            <div style="margin-top: 40px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Invoice
              </button>
            </div>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  }

  // Subscription tab methods
  getPlanFeatures(plan: string): string[] {
    const features = {
      basic: [
        'Up to 10 users',
        'Basic support',
        '1GB storage',
        'Standard templates'
      ],
      professional: [
        'Up to 50 users',
        'Priority support',
        '10GB storage',
        'Premium templates',
        'Custom domain'
      ],
      enterprise: [
        'Unlimited users',
        '24/7 support',
        'Unlimited storage',
        'Custom development',
        'Advanced analytics'
      ]
    };
    return features[plan as keyof typeof features] || [];
  }

  changePlan(company: Company): void {
    const plans = [
      { name: 'Basic', value: 'basic', price: 29 },
      { name: 'Professional', value: 'professional', price: 79 },
      { name: 'Enterprise', value: 'enterprise', price: 199 }
    ];

    const currentPlan = company.subscriptionPlan;
    const availablePlans = plans.filter(p => p.value !== currentPlan);

    let planOptions = `Current plan: ${currentPlan} ($${company.monthlyAmount}/month)\n\nSelect new plan:\n`;
    availablePlans.forEach((plan, index) => {
      planOptions += `${index + 1}. ${plan.name} - $${plan.price}/month\n`;
    });

    const choice = prompt(planOptions + '\nEnter plan number (1-' + availablePlans.length + '):');

    if (choice && !isNaN(Number(choice))) {
      const selectedIndex = Number(choice) - 1;
      if (selectedIndex >= 0 && selectedIndex < availablePlans.length) {
        const newPlan = availablePlans[selectedIndex];

        // Calculate prorated amount
        const oldAmount = company.monthlyAmount;
        const newAmount = newPlan.price;
        const difference = newAmount - oldAmount;

        if (confirm(`Change plan from ${currentPlan} to ${newPlan.value}?\n\nNew monthly amount: $${newAmount}\nDifference: ${difference > 0 ? '+' : ''}$${difference}`)) {
          company.subscriptionPlan = newPlan.value as 'basic' | 'professional' | 'enterprise';
          company.monthlyAmount = newAmount;

          alert(`Plan changed successfully!\nNew plan: ${newPlan.name}\nNew monthly amount: $${newAmount}`);
          console.log('Plan changed for:', company);
        }
      }
    }
  }

  // Add-ons tab methods
  isAddonActive(company: Company, addonId: number): boolean {
    return company.activeAddons.includes(addonId);
  }

  addAddon(company: Company, addon: Addon): void {
    if (!this.selectedAddons.find(a => a.id === addon.id)) {
      this.selectedAddons.push(addon);

      // Show immediate feedback
      const setupFeeText = addon.setupFee ? ` (+ $${addon.setupFee} setup fee)` : '';
      alert(`Added "${addon.name}" to your plan!\n\nMonthly cost: $${addon.monthlyPrice}${setupFeeText}\n\nClick "Apply Changes" to confirm.`);
    }
  }

  removeAddon(company: Company, addon: Addon): void {
    // Remove from active addons if currently active
    if (company.activeAddons.includes(addon.id)) {
      if (confirm(`Remove "${addon.name}" from your plan?\n\nThis will reduce your monthly bill by $${addon.monthlyPrice}.`)) {
        company.activeAddons = company.activeAddons.filter(id => id !== addon.id);
        company.monthlyAmount -= addon.monthlyPrice;
        alert(`"${addon.name}" has been removed from your plan.`);
      }
    } else {
      // Remove from selected addons if pending
      this.selectedAddons = this.selectedAddons.filter(a => a.id !== addon.id);
    }
  }

  getNewMonthlyTotal(company: Company): number {
    const addonTotal = this.selectedAddons.reduce((sum, addon) => sum + addon.monthlyPrice, 0);
    return company.monthlyAmount + addonTotal;
  }

  getSetupFees(): number {
    return this.selectedAddons.reduce((sum, addon) => sum + (addon.setupFee || 0), 0);
  }

  confirmAddonChanges(company: Company): void {
    if (this.selectedAddons.length === 0) {
      alert('No addon changes to apply.');
      return;
    }

    const totalMonthlyIncrease = this.selectedAddons.reduce((sum, addon) => sum + addon.monthlyPrice, 0);
    const totalSetupFees = this.getSetupFees();
    const newMonthlyTotal = company.monthlyAmount + totalMonthlyIncrease;

    let confirmMessage = `Confirm addon changes:\n\n`;
    this.selectedAddons.forEach(addon => {
      const setupFee = addon.setupFee ? ` + $${addon.setupFee} setup` : '';
      confirmMessage += `• ${addon.name}: $${addon.monthlyPrice}/month${setupFee}\n`;
    });
    confirmMessage += `\nNew monthly total: $${newMonthlyTotal}`;
    if (totalSetupFees > 0) {
      confirmMessage += `\nOne-time setup fees: $${totalSetupFees}`;
    }
    confirmMessage += `\n\nProceed with changes?`;

    if (confirm(confirmMessage)) {
      // Apply addon changes
      this.selectedAddons.forEach(addon => {
        if (!company.activeAddons.includes(addon.id)) {
          company.activeAddons.push(addon.id);
          company.monthlyAmount += addon.monthlyPrice;
        }
      });

      // Create billing record for setup fees if any
      if (totalSetupFees > 0) {
        console.log(`Setup fees charged: $${totalSetupFees}`);
      }

      const addedAddons = this.selectedAddons.map(a => a.name).join(', ');
      alert(`Addon changes applied successfully!\n\nAdded: ${addedAddons}\nNew monthly total: $${company.monthlyAmount}`);

      this.selectedAddons = [];
      console.log('Applied addon changes to:', company);
    }
  }

  // Settings tab methods
  suspendCompany(company: Company): void {
    if (company.status === 'suspended') {
      alert('Company is already suspended.');
      return;
    }

    const reason = prompt('Reason for suspension (optional):') || 'Administrative action';

    if (confirm(`Suspend ${company.name}?\n\nThis will:\n• Stop billing\n• Disable website access\n• Prevent user logins\n\nReason: ${reason}`)) {
      company.status = 'suspended';
      alert(`${company.name} has been suspended.`);
      console.log('Suspended company:', company, 'Reason:', reason);
    }
  }

  reactivateCompany(company: Company): void {
    if (company.status === 'active') {
      alert('Company is already active.');
      return;
    }

    if (confirm(`Reactivate ${company.name}?\n\nThis will:\n• Resume billing\n• Restore website access\n• Allow user logins`)) {
      company.status = 'active';
      alert(`${company.name} has been reactivated.`);
      console.log('Reactivated company:', company);
    }
  }

  deleteCompany(company: Company): void {
    const confirmText = company.name;
    const userInput = prompt(`⚠️ DANGER: This will permanently delete ${company.name} and all associated data.\n\nThis action CANNOT be undone!\n\nType "${confirmText}" to confirm deletion:`);

    if (userInput === confirmText) {
      const index = this.companies.findIndex(c => c.id === company.id);
      if (index > -1) {
        this.companies.splice(index, 1);
        this.applyFilters();
        this.closeDetails();
        alert(`${company.name} has been permanently deleted.`);
        console.log('Deleted company:', company);
      }
    } else if (userInput !== null) {
      alert('Company name did not match. Deletion cancelled.');
    }
  }

  // Modal methods
  addNewCompany(): void {
    // Validate required fields
    if (!this.newCompany.name?.trim()) {
      alert('Company name is required.');
      return;
    }

    if (!this.newCompany.domain?.trim()) {
      alert('Domain is required.');
      return;
    }

    if (!this.newCompany.contactEmail?.trim()) {
      alert('Contact email is required.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newCompany.contactEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check for duplicate domain
    if (this.companies.some(c => c.domain.toLowerCase() === this.newCompany.domain?.toLowerCase())) {
      alert('A company with this domain already exists.');
      return;
    }

    const planPricing = {
      basic: 29,
      professional: 79,
      enterprise: 199
    };

    const selectedPlan = this.newCompany.subscriptionPlan || 'basic';
    const monthlyAmount = planPricing[selectedPlan as keyof typeof planPricing];

    const company: Company = {
      id: Math.max(...this.companies.map(c => c.id)) + 1,
      name: this.newCompany.name.trim(),
      domain: this.newCompany.domain.trim().toLowerCase(),
      contactEmail: this.newCompany.contactEmail.trim().toLowerCase(),
      phone: this.newCompany.phone?.trim(),
      status: 'pending',
      subscriptionPlan: selectedPlan as 'basic' | 'professional' | 'enterprise',
      monthlyAmount: monthlyAmount,
      userCount: 1,
      lastBilling: new Date(),
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      billingCycle: 'monthly',
      lastFourDigits: '0000',
      autoRenewal: true,
      monthlyPageViews: 0,
      activeAddons: []
    };

    this.companies.push(company);
    this.applyFilters();
    this.showAddCompanyModal = false;

    // Reset form
    this.newCompany = { subscriptionPlan: 'basic' };

    // Show success message and select the new company
    alert(`${company.name} has been added successfully!\n\nPlan: ${selectedPlan}\nMonthly amount: $${monthlyAmount}`);
    this.selectCompany(company);

    console.log('Added new company:', company);
  }

  // Additional utility methods for enhanced functionality
  saveCompanySettings(): void {
    if (this.selectedCompany) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.selectedCompany.contactEmail)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(this.selectedCompany.domain)) {
        alert('Please enter a valid domain name (e.g., example.com).');
        return;
      }

      alert('Company settings saved successfully!');
      console.log('Saved company settings:', this.selectedCompany);
    }
  }

  exportBillingData(company: Company): void {
    const billingHistory = this.getBillingHistory(company);
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Status'],
      ...billingHistory.map(bill => [
        this.formatDate(bill.date),
        bill.description,
        bill.amount.toString(),
        bill.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.name}_billing_history.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  sendPaymentReminder(company: Company): void {
    if (company.status === 'suspended') {
      const confirmSend = confirm(`Send payment reminder to ${company.contactEmail}?\n\nThis will notify them about their outstanding balance of $${this.getOutstanding(company)}.`);

      if (confirmSend) {
        // Simulate sending email
        alert(`Payment reminder sent to ${company.contactEmail}!`);
        console.log('Payment reminder sent to:', company);
      }
    } else {
      alert('No outstanding payments for this company.');
    }
  }

  toggleAutoRenewal(company: Company): void {
    const action = company.autoRenewal ? 'disable' : 'enable';

    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} auto-renewal for ${company.name}?`)) {
      company.autoRenewal = !company.autoRenewal;
      alert(`Auto-renewal has been ${company.autoRenewal ? 'enabled' : 'disabled'}.`);
      console.log('Auto-renewal toggled for:', company);
    }
  }

  generateInvoice(company: Company): void {
    const nextBilling = company.nextBilling;
    const amount = company.monthlyAmount;

    const confirmGenerate = confirm(`Generate invoice for ${company.name}?\n\nAmount: $${amount}\nDue date: ${this.formatDate(nextBilling)}`);

    if (confirmGenerate) {
      // Create new billing record
      const newInvoice: BillingRecord = {
        id: Date.now(),
        date: nextBilling,
        description: `Monthly subscription - ${company.subscriptionPlan} plan`,
        amount: amount,
        status: 'pending'
      };

      alert(`Invoice generated for ${company.name}!\n\nInvoice #${newInvoice.id}\nAmount: $${amount}`);
      console.log('Generated invoice:', newInvoice);
    }
  }
}
