import { Component } from '@angular/core';

interface Customer {
  id: number;
  name: string;
  email: string;
  plan: 'Basic Plan' | 'Pro Plan' | 'Enterprise';
  nextPayment: string;
  amount: number;
  status: 'Active' | 'Overdue' | 'Cancelled' | 'Paused';
  joinDate?: string;
}

interface Payment {
  id: number;
  date: string;
  customer: string;
  amount: number;
  method: 'Credit Card' | 'PayPal' | 'Bank Transfer' | 'Wire Transfer';
  status: 'Completed' | 'Failed' | 'Pending' | 'Refunded';
  transactionId: string;
}

interface Invoice {
  id: number;
  number: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: 'Sent' | 'Paid' | 'Overdue' | 'Draft' | 'Cancelled';
  issueDate: string;
  items?: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Subscription {
  id: number;
  customer: string;
  plan: 'Basic Plan' | 'Pro Plan' | 'Enterprise';
  startDate: string;
  nextBilling: string;
  status: 'Active' | 'Paused' | 'Cancelled' | 'Trial';
  billingCycle: 'Monthly' | 'Yearly';
  discount?: number;
}

interface ServicePlan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  status: 'Active' | 'Inactive' | 'Deprecated';
  lastModified: string;
  isPopular?: boolean;
}

interface Service {
  id: number;
  name: string;
  category: 'Web Design' | 'Development' | 'SEO' | 'Marketing' | 'Consulting';
  hourlyRate: number;
  description: string;
  status: 'Active' | 'Inactive';
  lastModified: string;
}

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent {
  selectedTab: string = 'overview';
  showInvoiceModal: boolean = false;
  selectedInvoice: Invoice | null = null;
  showPricingModal: boolean = false;
  selectedPlan: ServicePlan | null = null;
  selectedService: Service | null = null;
  editingPrice: boolean = false;

  // Overview stats
  totalRevenue = 245680;
  monthlyRevenue = 28540;
  averageCustomerValue = 485;
  activeCustomers = 156;
  pendingPayments = 12;
  overdueInvoices = 3;

  // Customer billing data
  customers: Customer[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      plan: 'Pro Plan',
      nextPayment: '2025-09-15',
      amount: 99,
      status: 'Active',
      joinDate: '2024-03-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@startup.co',
      plan: 'Basic Plan',
      nextPayment: '2025-09-12',
      amount: 49,
      status: 'Active',
      joinDate: '2024-05-20'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@agency.net',
      plan: 'Enterprise',
      nextPayment: '2025-09-20',
      amount: 299,
      status: 'Overdue',
      joinDate: '2024-01-10'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa@design.com',
      plan: 'Pro Plan',
      nextPayment: '2025-09-18',
      amount: 99,
      status: 'Active',
      joinDate: '2024-07-08'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@tech.com',
      plan: 'Enterprise',
      nextPayment: '2025-09-25',
      amount: 299,
      status: 'Active',
      joinDate: '2024-02-14'
    }
  ];

  // Payment history
  paymentHistory: Payment[] = [
    {
      id: 1,
      date: '2025-08-15',
      customer: 'John Smith',
      amount: 99,
      method: 'Credit Card',
      status: 'Completed',
      transactionId: 'TXN-001234'
    },
    {
      id: 2,
      date: '2025-08-12',
      customer: 'Sarah Johnson',
      amount: 49,
      method: 'PayPal',
      status: 'Completed',
      transactionId: 'TXN-001235'
    },
    {
      id: 3,
      date: '2025-08-10',
      customer: 'Mike Wilson',
      amount: 299,
      method: 'Bank Transfer',
      status: 'Failed',
      transactionId: 'TXN-001236'
    },
    {
      id: 4,
      date: '2025-08-08',
      customer: 'Lisa Chen',
      amount: 99,
      method: 'Credit Card',
      status: 'Completed',
      transactionId: 'TXN-001237'
    },
    {
      id: 5,
      date: '2025-08-05',
      customer: 'David Brown',
      amount: 299,
      method: 'Wire Transfer',
      status: 'Completed',
      transactionId: 'TXN-001238'
    }
  ];

  // Invoices
  invoices: Invoice[] = [
    {
      id: 1,
      number: 'INV-2025-001',
      customer: 'John Smith',
      amount: 99,
      dueDate: '2025-09-15',
      status: 'Sent',
      issueDate: '2025-08-15',
      items: [
        { description: 'Pro Plan - Monthly', quantity: 1, rate: 99, amount: 99 }
      ]
    },
    {
      id: 2,
      number: 'INV-2025-002',
      customer: 'Sarah Johnson',
      amount: 49,
      dueDate: '2025-09-12',
      status: 'Paid',
      issueDate: '2025-08-12',
      items: [
        { description: 'Basic Plan - Monthly', quantity: 1, rate: 49, amount: 49 }
      ]
    },
    {
      id: 3,
      number: 'INV-2025-003',
      customer: 'Mike Wilson',
      amount: 299,
      dueDate: '2025-09-20',
      status: 'Overdue',
      issueDate: '2025-08-20',
      items: [
        { description: 'Enterprise Plan - Monthly', quantity: 1, rate: 299, amount: 299 }
      ]
    },
    {
      id: 4,
      number: 'INV-2025-004',
      customer: 'Lisa Chen',
      amount: 99,
      dueDate: '2025-09-18',
      status: 'Sent',
      issueDate: '2025-08-18',
      items: [
        { description: 'Pro Plan - Monthly', quantity: 1, rate: 99, amount: 99 }
      ]
    }
  ];

  // Subscriptions
  subscriptions: Subscription[] = [
    {
      id: 1,
      customer: 'John Smith',
      plan: 'Pro Plan',
      startDate: '2024-09-15',
      nextBilling: '2025-09-15',
      status: 'Active',
      billingCycle: 'Monthly'
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      plan: 'Basic Plan',
      startDate: '2024-08-12',
      nextBilling: '2025-09-12',
      status: 'Active',
      billingCycle: 'Monthly'
    },
    {
      id: 3,
      customer: 'Mike Wilson',
      plan: 'Enterprise',
      startDate: '2024-07-20',
      nextBilling: '2025-09-20',
      status: 'Paused',
      billingCycle: 'Monthly'
    },
    {
      id: 4,
      customer: 'Lisa Chen',
      plan: 'Pro Plan',
      startDate: '2024-06-18',
      nextBilling: '2025-09-18',
      status: 'Active',
      billingCycle: 'Monthly'
    },
    {
      id: 5,
      customer: 'David Brown',
      plan: 'Enterprise',
      startDate: '2024-02-14',
      nextBilling: '2025-09-25',
      status: 'Active',
      billingCycle: 'Yearly',
      discount: 20
    }
  ];

  // Service Plans (Subscription packages)
  servicePlans: ServicePlan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Perfect for small businesses and startups',
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        '5 Page Website',
        'Basic SEO Setup',
        'Contact Form',
        'Mobile Responsive',
        '1 Month Support'
      ],
      status: 'Active',
      lastModified: '2025-08-15'
    },
    {
      id: 2,
      name: 'Pro Plan',
      description: 'Ideal for growing businesses with advanced needs',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        '10 Page Website',
        'Advanced SEO',
        'E-commerce Integration',
        'Analytics Dashboard',
        'Blog Setup',
        '3 Months Support'
      ],
      status: 'Active',
      lastModified: '2025-08-20',
      isPopular: true
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'Complete solution for large organizations',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      features: [
        'Unlimited Pages',
        'Custom Development',
        'Priority Support',
        'Advanced Analytics',
        'Custom Integrations',
        '12 Months Support',
        'Dedicated Account Manager'
      ],
      status: 'Active',
      lastModified: '2025-08-25'
    },
    {
      id: 4,
      name: 'Starter Plan',
      description: 'Entry-level package (Deprecated)',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        '3 Page Website',
        'Basic Contact Form',
        'Mobile Responsive'
      ],
      status: 'Deprecated',
      lastModified: '2025-07-01'
    }
  ];

  // Individual Services (Hourly rates)
  services: Service[] = [
    {
      id: 1,
      name: 'Website Design',
      category: 'Web Design',
      hourlyRate: 85,
      description: 'Custom website design and user interface development',
      status: 'Active',
      lastModified: '2025-08-15'
    },
    {
      id: 2,
      name: 'Frontend Development',
      category: 'Development',
      hourlyRate: 95,
      description: 'HTML, CSS, JavaScript, and framework development',
      status: 'Active',
      lastModified: '2025-08-20'
    },
    {
      id: 3,
      name: 'Backend Development',
      category: 'Development',
      hourlyRate: 110,
      description: 'Server-side development and API integration',
      status: 'Active',
      lastModified: '2025-08-22'
    },
    {
      id: 4,
      name: 'SEO Optimization',
      category: 'SEO',
      hourlyRate: 75,
      description: 'Search engine optimization and content strategy',
      status: 'Active',
      lastModified: '2025-08-18'
    },
    {
      id: 5,
      name: 'Digital Marketing',
      category: 'Marketing',
      hourlyRate: 65,
      description: 'Social media marketing and online advertising',
      status: 'Active',
      lastModified: '2025-08-10'
    },
    {
      id: 6,
      name: 'Technical Consulting',
      category: 'Consulting',
      hourlyRate: 125,
      description: 'Strategic technology consulting and architecture planning',
      status: 'Active',
      lastModified: '2025-08-25'
    },
    {
      id: 7,
      name: 'Graphic Design',
      category: 'Web Design',
      hourlyRate: 70,
      description: 'Logo design, branding, and visual assets',
      status: 'Inactive',
      lastModified: '2025-07-15'
    }
  ];

  constructor() { }

  // Tab management
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  // Customer actions
  viewCustomer(customer: Customer): void {
    console.log('View customer:', customer);
    // TODO: Implement customer detail modal/page
  }

  editCustomer(customer: Customer): void {
    console.log('Edit customer:', customer);
    // TODO: Implement edit customer modal/form
  }

  // Payment actions
  downloadPaymentReceipt(payment: Payment): void {
    console.log('Download receipt for payment:', payment);
    // TODO: Implement receipt download
    alert(`Downloading receipt for transaction ${payment.transactionId}`);
  }

  retryFailedPayment(payment: Payment): void {
    if (payment.status === 'Failed') {
      payment.status = 'Pending';
      console.log('Retrying payment:', payment);
      // TODO: Implement payment retry logic
      alert(`Retrying payment for ${payment.customer}`);
    }
  }

  refundPayment(payment: Payment): void {
    if (confirm(`Are you sure you want to refund $${payment.amount} to ${payment.customer}?`)) {
      payment.status = 'Refunded';
      console.log('Refunded payment:', payment);
      // TODO: Implement refund logic
    }
  }

  // Invoice actions
  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showInvoiceModal = true;
  }

  downloadInvoice(invoice: Invoice): void {
    console.log('Download invoice:', invoice);
    // TODO: Implement invoice download/PDF generation
    alert(`Downloading invoice ${invoice.number}`);
  }

  sendInvoice(invoice: Invoice): void {
    console.log('Send invoice:', invoice);
    // TODO: Implement email sending
    alert(`Invoice ${invoice.number} sent to ${invoice.customer}`);
  }

  markInvoicePaid(invoice: Invoice): void {
    if (confirm(`Mark invoice ${invoice.number} as paid?`)) {
      invoice.status = 'Paid';
      console.log('Invoice marked as paid:', invoice);
    }
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.selectedInvoice = null;
  }

  // Subscription actions
  pauseSubscription(subscription: Subscription): void {
    if (confirm(`Are you sure you want to pause ${subscription.customer}'s subscription?`)) {
      subscription.status = 'Paused';
      console.log('Subscription paused:', subscription);
    }
  }

  cancelSubscription(subscription: Subscription): void {
    if (confirm(`Are you sure you want to cancel ${subscription.customer}'s subscription? This action cannot be undone.`)) {
      subscription.status = 'Cancelled';
      console.log('Subscription cancelled:', subscription);
    }
  }

  reactivateSubscription(subscription: Subscription): void {
    if (subscription.status === 'Paused' || subscription.status === 'Cancelled') {
      subscription.status = 'Active';
      console.log('Subscription reactivated:', subscription);
    }
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'overdue': return 'status-overdue';
      case 'failed': return 'status-failed';
      case 'pending': return 'status-pending';
      case 'paused': return 'status-paused';
      case 'cancelled': return 'status-cancelled';
      case 'refunded': return 'status-refunded';
      case 'draft': return 'status-draft';
      case 'trial': return 'status-trial';
      default: return 'status-default';
    }
  }

  getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'Basic Plan': return 'plan-basic';
      case 'Pro Plan': return 'plan-pro';
      case 'Enterprise': return 'plan-enterprise';
      default: return 'plan-default';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Revenue calculations
  get monthlyGrowthPercentage(): number {
    // Mock calculation - in real app, this would be calculated from historical data
    return 8.3;
  }

  get totalGrowthPercentage(): number {
    // Mock calculation
    return 12.5;
  }

  get averageValueGrowthPercentage(): number {
    // Mock calculation
    return 5.2;
  }

  // Service Pricing Management
  editServicePlan(plan: ServicePlan): void {
    this.selectedPlan = { ...plan };
    this.editingPrice = true;
    this.showPricingModal = true;
  }

  editService(service: Service): void {
    this.selectedService = { ...service };
    this.editingPrice = true;
    this.showPricingModal = true;
  }

  createNewServicePlan(): void {
    this.selectedPlan = {
      id: 0,
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [],
      status: 'Active',
      lastModified: new Date().toISOString().split('T')[0]
    };
    this.editingPrice = true;
    this.showPricingModal = true;
  }

  createNewService(): void {
    this.selectedService = {
      id: 0,
      name: '',
      category: 'Web Design',
      hourlyRate: 0,
      description: '',
      status: 'Active',
      lastModified: new Date().toISOString().split('T')[0]
    };
    this.editingPrice = true;
    this.showPricingModal = true;
  }

  saveServicePlan(): void {
    if (this.selectedPlan) {
      if (this.selectedPlan.id === 0) {
        // Creating new plan
        this.selectedPlan.id = Math.max(...this.servicePlans.map(p => p.id)) + 1;
        this.servicePlans.push(this.selectedPlan);
      } else {
        // Updating existing plan
        const index = this.servicePlans.findIndex(p => p.id === this.selectedPlan!.id);
        if (index !== -1) {
          this.selectedPlan.lastModified = new Date().toISOString().split('T')[0];
          this.servicePlans[index] = this.selectedPlan;
        }
      }
      this.closePricingModal();
    }
  }

  saveService(): void {
    if (this.selectedService) {
      if (this.selectedService.id === 0) {
        // Creating new service
        this.selectedService.id = Math.max(...this.services.map(s => s.id)) + 1;
        this.services.push(this.selectedService);
      } else {
        // Updating existing service
        const index = this.services.findIndex(s => s.id === this.selectedService!.id);
        if (index !== -1) {
          this.selectedService.lastModified = new Date().toISOString().split('T')[0];
          this.services[index] = this.selectedService;
        }
      }
      this.closePricingModal();
    }
  }

  deleteServicePlan(plan: ServicePlan): void {
    if (confirm(`Are you sure you want to delete the ${plan.name}? This action cannot be undone.`)) {
      this.servicePlans = this.servicePlans.filter(p => p.id !== plan.id);
    }
  }

  deleteService(service: Service): void {
    if (confirm(`Are you sure you want to delete ${service.name}? This action cannot be undone.`)) {
      this.services = this.services.filter(s => s.id !== service.id);
    }
  }

  toggleServicePlanStatus(plan: ServicePlan): void {
    const index = this.servicePlans.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      this.servicePlans[index].status =
        this.servicePlans[index].status === 'Active' ? 'Inactive' : 'Active';
      this.servicePlans[index].lastModified = new Date().toISOString().split('T')[0];
    }
  }

  toggleServiceStatus(service: Service): void {
    const index = this.services.findIndex(s => s.id === service.id);
    if (index !== -1) {
      this.services[index].status =
        this.services[index].status === 'Active' ? 'Inactive' : 'Active';
      this.services[index].lastModified = new Date().toISOString().split('T')[0];
    }
  }

  closePricingModal(): void {
    this.showPricingModal = false;
    this.selectedPlan = null;
    this.selectedService = null;
    this.editingPrice = false;
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Web Design': return 'category-design';
      case 'Development': return 'category-development';
      case 'SEO': return 'category-seo';
      case 'Marketing': return 'category-marketing';
      case 'Consulting': return 'category-consulting';
      default: return 'category-default';
    }
  }

  addFeatureToSelectedPlan(): void {
    if (this.selectedPlan) {
      this.selectedPlan.features.push('');
    }
  }

  removeFeatureFromSelectedPlan(index: number): void {
    if (this.selectedPlan) {
      this.selectedPlan.features.splice(index, 1);
    }
  }

  trackByFeature(index: number, feature: string): number {
    return index;
  }
}
