import { ChangeDetectorRef, Component, OnChanges, SimpleChanges, HostListener, OnDestroy } from '@angular/core';
import { UserServiceService } from '../services/user-service.service';
import { User } from '../models/User';

enum MainTabs {
  Onboarding = 'onboarding',
  Dashboard = 'dashboard',
  Projects = 'projects',
  Designs = 'designs',
  Content = 'content',
  Billing = 'billing',
  Support = 'support'
}

// Navigation type enum to determine if tab should scroll or change page
enum NavigationType {
  PAGE_CHANGE = 'page',
  SCROLL_TO_SECTION = 'scroll'
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnDestroy, OnChanges {
  administrator = false;
  user: User | null = null;
  email = 'kndl.test@gmail.com';
  selectedTab: string = 'onboarding';
  tabs = Object.values(MainTabs);
  subTab: string = '';
  availableSectionIds: string[] = [];
  onboaringCompleted: boolean = false;
  showMobileNav: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;
  constructor(private userService: UserServiceService, private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTab']) {
      this.onTabChange(this.selectedTab);
    }
  }

  ngOnInit() {
    this.verifyLogin();
    /*this.userService.getUser(this.email).subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.verifyOnboardingCompletion(user);
      }
    });*/

    this.onTabChange(this.selectedTab)
  }

  verifyOnboardingCompletion(user: User) {
    this.onboaringCompleted = user.onboardingCompleted || false;
    this.selectedTab = this.onboaringCompleted ? 'overview' : 'onboarding';
  }

  onTabChange(tab: string) {
    this.selectedTab = tab;
    this.cdr.detectChanges(); // Ensure the view updates before scrolling
    const ids = Array.from(document.querySelectorAll('section[id],div[id]')).map(
      (el: Element) => el.id
    );
    this.availableSectionIds = ids;
    this.cdr.detectChanges();
  }

  onSubTabChange(id: string) {
    this.scrollToElement(id);
    this.subTab = id;
  }

  scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  verifyLogin() {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }

    this.user = user ? JSON.parse(user) : null;
    this.administrator = !!(this.user && this.user.roles && this.user.roles.includes('admin'));
    if (this.administrator) {
      this.onTabChange('admin');
    }
  }

  onSectionIds(ids: string[]) {
    Promise.resolve().then(() => {
      this.availableSectionIds = ids;
      // Set the first section as active if no subTab is set
      if (ids.length > 0 && !this.subTab) {
        this.subTab = ids[0];
      }
      // Setup intersection observer for scroll spy
      this.setupScrollSpy();
    });
  }

  onSetSubTab(id: string) {
    this.subTab = id;
  }

  setupScrollSpy() {
    // Disconnect existing observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Create new intersection observer
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            this.subTab = entry.target.id;
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Observe all sections
    this.availableSectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    this.updateActiveTabOnScroll();
  }

  updateActiveTabOnScroll() {
    const scrollElement = document.querySelector('.overflow-auto');
    if (!scrollElement) return;

    const scrollTop = scrollElement.scrollTop;
    const scrollOffset = 100; // Offset from top to trigger tab change

    // Find which section is currently in view
    for (let i = this.availableSectionIds.length - 1; i >= 0; i--) {
      const sectionId = this.availableSectionIds[i];
      const element = document.getElementById(sectionId);

      if (element) {
        const elementTop = element.offsetTop - scrollOffset;

        if (scrollTop >= elementTop) {
          if (this.subTab !== sectionId) {
            this.subTab = sectionId;
          }
          break;
        }
      }
    }
  }

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Mobile navigation methods
  toggleMobileNav() {
    this.showMobileNav = !this.showMobileNav;
  }

  closeMobileNav() {
    this.showMobileNav = false;
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
