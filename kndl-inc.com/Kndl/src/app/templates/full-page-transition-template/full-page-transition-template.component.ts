import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-full-page-transition-template',
  templateUrl: './full-page-transition-template.component.html',
  styleUrls: ['./full-page-transition-template.component.scss']
})
export class FullPageTransitionTemplateComponent {
  scrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.scrolled = st > 40;
  }
}