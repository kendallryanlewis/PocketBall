import { Component } from '@angular/core';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kndl-pricing',
  templateUrl: './kndl-pricing.component.html',
  styleUrls: ['./kndl-pricing.component.scss']
})
export class KndlPricingComponent {

  constructor(private router: Router) { }

  selectPackage(packageName: string) {
    this.router.navigate(['/package', packageName]);
  }
}
