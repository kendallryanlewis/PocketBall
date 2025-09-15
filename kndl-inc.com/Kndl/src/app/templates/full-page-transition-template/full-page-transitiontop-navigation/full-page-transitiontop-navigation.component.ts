import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-full-page-transitiontop-navigation',
  templateUrl: './full-page-transitiontop-navigation.component.html',
  styleUrls: ['./full-page-transitiontop-navigation.component.scss']
})
export class FullPageTransitiontopNavigationComponent {

  scrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.scrolled = st > 40;
  }
}
