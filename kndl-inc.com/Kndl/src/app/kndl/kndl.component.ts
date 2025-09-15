import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-kndl',
  templateUrl: './kndl.component.html',
  styleUrls: ['./kndl.component.scss']
})

export class KndlComponent {
  atTop = true;
  atBottom = false;
  activeView: 'home' | 'aboutus' | 'services' | 'pricing' | 'contacts' | 'market' = 'home';


  scrollToSection(section: 'home' | 'aboutus' | 'services' | 'pricing' | 'contacts' | 'market') {
    const element = document.querySelector(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeView = section;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.atTop = window.scrollY === 0;

    // threshold in pixels for being "atBottom"
    const threshold = 2;
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = window.document.documentElement.scrollHeight;

    this.atBottom = (pageHeight - scrollPosition) <= threshold;

    const sections = [
      { id: 'home', element: document.querySelector('app-kndl-about-us') },
      { id: 'aboutus', element: document.querySelector('app-kndl-detailed-services') },
      { id: 'services', element: document.querySelector('app-kndl-pricing') },
      { id: 'pricing', element: document.querySelector('app-kndl-add-ons') }
    ];

    for (const section of sections) {
      if (section.element) {
        const rect = section.element.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          this.activeView = section.id as 'home' | 'aboutus' | 'services' | 'pricing' | 'contacts' | 'market';
          break;
        }
      }
    }
  }
}


