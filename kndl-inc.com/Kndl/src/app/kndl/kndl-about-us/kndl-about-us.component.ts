import { Component } from '@angular/core';

@Component({
  selector: 'app-kndl-about-us',
  templateUrl: './kndl-about-us.component.html',
  styleUrls: ['./kndl-about-us.component.scss', '../kndl.component.scss']
})
export class KndlAboutUsComponent {
  longStory = false;

  toggleStory() {
    this.longStory = !this.longStory;
  }
}
