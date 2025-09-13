
import { Component } from '@angular/core';
import { Addon, recurringAddons, oneTimeAddons } from '../addons.data';

@Component({
  selector: 'app-kndl-add-ons',
  templateUrl: './kndl-add-ons.component.html',
  styleUrls: ['./kndl-add-ons.component.scss']
})
export class KndlAddOnsComponent {
  showAllAddons = false;
  popularAddonsCount = 6;

  recurringAddons = recurringAddons;
  oneTimeAddons = oneTimeAddons;
}
