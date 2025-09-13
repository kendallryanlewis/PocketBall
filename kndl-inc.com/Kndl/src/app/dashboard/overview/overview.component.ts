import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { UserServiceService } from '../../services/user-service.service';
import { User, UserPlatform } from '../../models/User';

interface CustomerProject {
  id: string;
  name: string;
  status: 'active' | 'in-progress' | 'completed' | 'on-hold';
  type: 'website' | 'domain' | 'hosting' | 'maintenance';
  lastUpdated: Date;
  nextMilestone?: string;
  progress: number;
  url?: string;
}

interface RecentActivity {
  id: string;
  type: 'payment' | 'update' | 'support' | 'milestone';
  description: string;
  date: Date;
  amount?: number;
  status?: string;
}

interface ServiceStatus {
  name: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  renewalDate?: Date;
  monthlyFee?: number;
  icon: string;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss', '../dashboard.component.scss']
})
export class OverviewComponent implements OnInit {
  user: User | null = null;
  projects: CustomerProject[] = [];
  recentActivities: RecentActivity[] = [];
  services: ServiceStatus[] = [];
  transfers: Array<{
    logo: string;
    company: string;
    description: string;
    lastFour: string;
    date: string;
    amount: number;
  }> = [];
  payments: Array<{
    cardColor: string;
    expiry: string;
    lastFour: string;
    service: string;
    amount: number;
    currency: string;
    icon: string;
  }> = [];
  isLoading = true;
  websites: string[] = [];
  selectedSite: string = "Kendallryanlewis.com";
  companyName: string = "KNDL Inc.";

  constructor(
    private communicationService: ComponentCommunicationService,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.loadCustomerData();
    this.getWebsties();
    this.loadMockTransfers();
    this.loadMockPayments();
  }

  getWebsties() {
    // In a real application, fetch the websites from the user data or an API
    if (this.user) {
      this.websites = ["Kendallryanlewis.com", "kndl-inc.com"];
      /*this.websites = this.user.platforms.map((platform: UserPlatform) => platform.domain);
      if (this.websites.length > 0) {
        this.selectedSite = this.websites[0];
      }*/
    }
  }

  loadCustomerData() {
    // For now, create a mock user until we implement proper user management
    this.user = {
      id: '1',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      onboardingCompleted: true,
      platforms: []
    };

    // Generate mock data for demo purposes
    this.loadMockProjects();
    this.loadMockActivities();
    this.loadMockServices();

    this.isLoading = false;
  }

  private loadMockProjects() {
    this.projects = [
      {
        id: '1',
        name: 'Business Website',
        status: 'in-progress',
        type: 'website',
        lastUpdated: new Date('2025-08-25'),
        nextMilestone: 'Content Review',
        progress: 65,
        url: 'https://your-site.com'
      },
      {
        id: '2',
        name: 'Domain Setup',
        status: 'completed',
        type: 'domain',
        lastUpdated: new Date('2025-08-20'),
        progress: 100
      },
      {
        id: '3',
        name: 'SEO Optimization',
        status: 'active',
        type: 'website',
        lastUpdated: new Date('2025-08-28'),
        nextMilestone: 'Keyword Research',
        progress: 30
      }
    ];
  }

  private loadMockActivities() {
    this.recentActivities = [
      {
        id: '1',
        type: 'milestone',
        description: 'Website design approved',
        date: new Date('2025-08-27'),
        status: 'completed'
      },
      {
        id: '2',
        type: 'payment',
        description: 'Monthly hosting payment',
        date: new Date('2025-08-25'),
        amount: 29.99,
        status: 'completed'
      },
      {
        id: '3',
        type: 'update',
        description: 'Content updates published',
        date: new Date('2025-08-23'),
        status: 'completed'
      },
      {
        id: '4',
        type: 'support',
        description: 'Support ticket resolved',
        date: new Date('2025-08-20'),
        status: 'completed'
      }
    ];
  }

  private loadMockServices() {
    this.services = [
      {
        name: 'Web Hosting',
        status: 'active',
        renewalDate: new Date('2025-09-15'),
        monthlyFee: 29.99,
        icon: 'fas fa-server'
      },
      {
        name: 'Domain Registration',
        status: 'active',
        renewalDate: new Date('2026-01-12'),
        monthlyFee: 15.99,
        icon: 'fas fa-globe'
      },
      {
        name: 'SSL Certificate',
        status: 'active',
        renewalDate: new Date('2026-01-12'),
        icon: 'fas fa-shield-alt'
      },
      {
        name: 'Maintenance Plan',
        status: 'active',
        monthlyFee: 99.99,
        icon: 'fas fa-tools'
      }
    ];
  }

  private loadMockTransfers() {
    this.transfers = [
      {
        logo: "https://assets.codepen.io/285131/apple.svg",
        company: "Apple Inc.",
        description: "Apple ID Payment",
        lastFour: "4012",
        date: "28 Oct. 21",
        amount: 550
      },
      {
        logo: "https://assets.codepen.io/285131/pinterest.svg",
        company: "Pinterest",
        description: "2 year subscription",
        lastFour: "5214",
        date: "26 Oct. 21",
        amount: 120
      },
      {
        logo: "https://assets.codepen.io/285131/warner-bros.svg",
        company: "Warner Bros.",
        description: "Cinema",
        lastFour: "2228",
        date: "22 Oct. 21",
        amount: 70
      }
    ];
  }

  private loadMockPayments() {
    this.payments = [
      {
        cardColor: "green",
        expiry: "01/22",
        lastFour: "4012",
        service: "Internet",
        amount: 2110,
        currency: "USD",
        icon: "ph-caret-right-bold"
      },
      {
        cardColor: "olive",
        expiry: "12/23",
        lastFour: "2228",
        service: "Universal",
        amount: 5621,
        currency: "USD",
        icon: "ph-caret-right-bold"
      },
      {
        cardColor: "gray",
        expiry: "03/22",
        lastFour: "5214",
        service: "Gold",
        amount: 3473,
        currency: "USD",
        icon: "ph-caret-right-bold"
      }
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
      case 'completed':
        return 'status-success';
      case 'in-progress':
        return 'status-progress';
      case 'on-hold':
      case 'pending':
        return 'status-warning';
      case 'expired':
      case 'suspended':
        return 'status-error';
      default:
        return 'status-default';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'payment':
        return 'fas fa-credit-card';
      case 'update':
        return 'fas fa-edit';
      case 'support':
        return 'fas fa-headset';
      case 'milestone':
        return 'fas fa-flag-checkered';
      default:
        return 'fas fa-info-circle';
    }
  }

  getDaysUntilRenewal(renewalDate: Date): number {
    const today = new Date();
    const timeDiff = renewalDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  get activeServicesCount(): number {
    return this.services.filter(s => s.status === 'active').length;
  }

  navigateToProject(project: CustomerProject) {
    // Navigate to project details or external URL
    if (project.url) {
      window.open(project.url, '_blank');
    } else {
      // Navigate to project management section
      console.log('Navigate to project:', project.id);
    }
  }

  viewAllProjects() {
    console.log('Navigate to all projects');
  }

  viewAllActivities() {
    console.log('Navigate to all activities');
  }

  manageServices() {
    console.log('Navigate to services management');
  }

  get CompanyName(): string {
    return this.companyName || "Your Company";
  }

  set CompanyName(name: string) {
    this.companyName = name;
  }

}
