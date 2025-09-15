import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/User';

interface MetricCard {
  icon: string;
  title: string;
  value: number;
  subtitle: string;
  class: string;
}

interface Billing {
  id: string;
  customer: string;
  amount: number;
  date: string;
  service: string;
  status: string;
}

interface UrgentBilling {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
  overdueDays: number;
  service: string;
  status: string;
  priority: string;
}

interface RevenueMonth {
  month: string;
  revenue: number;
  taxes: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements AfterViewInit {
  @Output() sectionIds = new EventEmitter<string[]>();
  // Metrics for cards
  user: User = {} as User;
  totalRevenue = 285400;
  taxesOwed = 42810;
  quarterlyTaxEstimate = 71350;
  nextTaxDeadline = '2025-10-15';
  totalOverdue = 5650;
  overdueCount = 3;

  cardData: MetricCard[] = [
    {
      icon: 'fa-dollar',
      title: 'Total Revenue (YTD)',
      value: this.totalRevenue,
      subtitle: '+12.5% from last year',
      class: 'revenue'
    },
    {
      icon: 'fa-file-text',
      title: 'Taxes Owed (Current)',
      value: this.taxesOwed,
      subtitle: 'Due: ' + this.nextTaxDeadline,
      class: 'taxes'
    },
    {
      icon: 'fa-calendar',
      title: 'Quarterly Estimate',
      value: this.quarterlyTaxEstimate,
      subtitle: 'Q4 2025 Estimate',
      class: 'quarterly'
    },
    {
      icon: 'fa-exclamation-triangle',
      title: 'Overdue Amount',
      value: this.totalOverdue,
      subtitle: this.overdueCount + ' invoices',
      class: 'overdue'
    }
  ];

  // Recent Billings
  recentBillings: Billing[] = [
    {
      id: 'BILL-2025-156',
      customer: 'TechCorp Solutions',
      amount: 2500,
      date: '2025-09-03',
      service: 'Enterprise Website Package',
      status: 'Paid'
    },
    {
      id: 'BILL-2025-155',
      customer: 'StartupXYZ',
      amount: 1200,
      date: '2025-09-02',
      service: 'Pro Design Package',
      status: 'Paid'
    },
    {
      id: 'BILL-2025-154',
      customer: 'Local Business Inc',
      amount: 850,
      date: '2025-09-01',
      service: 'Basic Website Package',
      status: 'Pending'
    },
    {
      id: 'BILL-2025-153',
      customer: 'Creative Agency',
      amount: 1800,
      date: '2025-08-30',
      service: 'Brand Identity Package',
      status: 'Paid'
    }
  ];

  // Urgent/Failed Billings
  urgentBillings: UrgentBilling[] = [
    {
      id: 'BILL-2025-147',
      customer: 'Delayed Payments LLC',
      amount: 3200,
      dueDate: '2025-08-25',
      overdueDays: 10,
      service: 'Enterprise Website Package',
      status: 'Overdue',
      priority: 'High'
    },
    {
      id: 'BILL-2025-149',
      customer: 'Payment Issues Corp',
      amount: 1500,
      dueDate: '2025-08-28',
      overdueDays: 7,
      service: 'Pro Design Package',
      status: 'Payment Failed',
      priority: 'Urgent'
    },
    {
      id: 'BILL-2025-151',
      customer: 'Late Client Co',
      amount: 950,
      dueDate: '2025-09-01',
      overdueDays: 3,
      service: 'Basic Package',
      status: 'Overdue',
      priority: 'Medium'
    }
  ];

  // Monthly Revenue Breakdown
  monthlyRevenue: RevenueMonth[] = [
    { month: 'January', revenue: 28400, taxes: 4260 },
    { month: 'February', revenue: 31200, taxes: 4680 },
    { month: 'March', revenue: 29800, taxes: 4470 },
    { month: 'April', revenue: 33500, taxes: 5025 },
    { month: 'May', revenue: 35200, taxes: 5280 },
    { month: 'June', revenue: 32100, taxes: 4815 },
    { month: 'July', revenue: 36800, taxes: 5520 },
    { month: 'August', revenue: 38400, taxes: 5760 },
    { month: 'September', revenue: 20000, taxes: 3000 }
  ];

  // Payment Stats
  successfulPayments = 24;
  failedPayments = 3;

  // Tax Estimate Section
  taxEstimateLeast = 32000;
  taxEstimateAverage = 42810;
  taxEstimateMost = 56000;

  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
    'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
    'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  selectedState: string = 'California';
  federalFilingStatus: string = 'single';


  constructor() {
    this.user = this.getUser() || {} as User;
  }

  ngAfterViewInit() {
    // Collect all section IDs in the rendered view
    const ids = Array.from(document.querySelectorAll('section[id],div[id]')).map(
      (el: Element) => el.id
    );
    this.sectionIds.emit(ids);
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      return userObj;
    }
    return {
      email: 'admin@example.com',
      // Add other required User properties here
    } as User;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Urgent': return '#ff4757';
      case 'High': return '#ff6b35';
      case 'Medium': return '#ffa502';
      default: return '#2ed573';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid': return '#2ed573';
      case 'Pending': return '#ffa502';
      case 'Overdue': return '#ff6b35';
      case 'Payment Failed': return '#ff4757';
      default: return '#747d8c';
    }
  }

  getMaxRevenue(): number {
    return Math.max(...this.monthlyRevenue.map(m => m.revenue));
  }
}
