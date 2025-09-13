import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kndl-service',
  templateUrl: './kndl-service.component.html',
  styleUrls: ['./kndl-service.component.scss']
})
export class KndlServiceComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChildren('optionVideo') optionVideos!: QueryList<ElementRef<HTMLVideoElement>>;
  plans = [
    { title: 'Starter', color: '#343a40' },
    { title: 'Growth', color: '#495057' },
    { title: 'Pro', color: '#212529' }
  ];

  optionList = [
    {
      video: 'assets/Video/foggy.mp4',
      icon: 'fas fa-rocket',
      main: this.plans[0].title,
      sub: 'Perfect for new businesses needing brand essentials.',
      title: this.plans[0].title,
      tiles: ['Logo Design', 'One-Page Site', 'Google Business', 'Business Cards', '1 Week Delivery'],
      description: `Logo refresh/basic logo, 1 social profile, one-page site (WordPress/Wix), business card + mini guide, Google Business setup. Perfect for local service businesses just getting started online.`,
      color: this.plans[0].color,
      timeline: '≤ 1 week',
      revisions: '1 round'
    },
    {
      video: 'assets/Video/office.mp4',
      icon: 'fas fa-chart-line',
      main: this.plans[1].title,
      sub: 'Comprehensive digital presence for growing businesses.',
      title: this.plans[1].title,
      tiles: ['Full Brand Kit', 'Multi-Page Site', 'Social Profiles', 'Print Materials', '2 Weeks Delivery'],
      description: `Full brand kit (logos, fonts, colors), 2–3 social profiles + banners, multi-page site, print materials (cards/flyer/postcard), 5 social templates. Ideal for established businesses ready to scale.`,
      color: this.plans[1].color,
      timeline: '1–2 weeks',
      revisions: '2 rounds'
    },
    {
      video: 'assets/Video/city.mp4',
      icon: 'fas fa-crown',
      main: this.plans[2].title,
      sub: 'Custom solutions for established practices and enterprises.',
      title: this.plans[2].title,
      tiles: ['Custom Site', 'Full Brand Package', 'SEO Optimization', 'Advanced Features', '4 Weeks Delivery'],
      description: `Custom site (Angular or advanced WordPress), full brand kit + collateral, advanced print (brochures/banners/signage mockups), SEO basics (on-page, indexing, performance), 10 social templates. Perfect for businesses that need advanced functionality.`,
      color: this.plans[2].color,
      timeline: '2–4 weeks',
      revisions: '2–3 rounds'
    }
  ];

  hoverIndex: number | null = 1; // Start with second option active
  selectedIndex: number | null = null; // Track which option is selected for popover
  selectedFeatureIndex: number = 0; // Track which feature is selected

  private packageSubscription: Subscription = new Subscription();

  activeIndex: number = 0;
  initialAnimationDone: boolean[] = [];

  constructor(
    private communicationService: ComponentCommunicationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initialAnimationDone = this.optionList.map(() => false);
    // Listen for package selections from the pricing component
    this.packageSubscription = this.communicationService.packageSelected$.subscribe(
      (packageName: string) => {
        this.selectPackageByName(packageName);
      }
    );
  }

  ngAfterViewInit() {
    this.optionVideos.changes.subscribe(() => this.updateVideoPlayback());
    // Initialize the video playback for the first load
    setTimeout(() => this.updateVideoPlayback(), 0);
  }

  ngOnDestroy() {
    // Clean up subscription
    this.packageSubscription.unsubscribe();
  }

  getAnimationClass(index: number): string {
    if (index === 0) return 'fade-right';
    if (index === 1) return 'fade';
    if (index === 2) return 'fade-left';
    return 'fade';
  }

  onAnimationEnd(index: number) {
    this.initialAnimationDone[index] = true;
  }

  selectPackageByName(packageName: string) {
    const index = this.optionList.findIndex(option => option.title === packageName);
    if (index !== -1) {
      this.onOptionClick(index);
    }
  }

  onMouseEnter(index: number) {
    if (this.selectedIndex === null) { // Only allow hover if not expanded
      this.hoverIndex = index;
      this.updateVideoPlayback();
    }
  }


  onOptionClick(index: number) {
    // Navigate to the package detail page using the package name
    const packageName = this.optionList[index].title.toLowerCase();
    this.router.navigate(['/package', packageName]);
  }

  setCurrentSection(section: string) {
    // Reset feature selection when switching sections
    if (section === 'overview') {
      this.selectedFeatureIndex = 0;
    }
  }

  onFeatureClick(index: number) {
    this.selectedFeatureIndex = index;
  }

  updateVideoPlayback() {
    if (!this.optionVideos) return;
    this.optionVideos.forEach((videoRef, i) => {
      const video = videoRef.nativeElement;
      if (i === this.hoverIndex) {
        video.play();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }
}


