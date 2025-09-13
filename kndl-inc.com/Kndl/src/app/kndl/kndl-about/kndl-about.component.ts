import { Component } from '@angular/core';

@Component({
  selector: 'app-kndl-about',
  templateUrl: './kndl-about.component.html',
  styleUrls: ['./kndl-about.component.scss']
})
export class KndlAboutComponent {
  isLoggingIn = localStorage.getItem('administrator') !== 'true';
}
