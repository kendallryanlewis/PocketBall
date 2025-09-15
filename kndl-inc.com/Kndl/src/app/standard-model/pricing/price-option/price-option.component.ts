import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price-option',
  templateUrl: './price-option.component.html',
  styleUrls: ['./price-option.component.scss']
})
export class PriceOptionComponent {
  @Input() item: String = "";
}
