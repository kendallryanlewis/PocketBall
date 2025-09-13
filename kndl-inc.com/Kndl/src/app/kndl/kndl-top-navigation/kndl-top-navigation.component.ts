import { Component } from '@angular/core';

@Component({
  selector: 'app-kndl-top-navigation',
  templateUrl: './kndl-top-navigation.component.html',
  styleUrls: ['./kndl-top-navigation.component.scss']
})
export class KndlTopNavigationComponent {
  isLoggingIn = localStorage.getItem('administrator') !== 'true';

  scrollToSection(sectionSelector: string) {
    const element = document.querySelector(sectionSelector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
