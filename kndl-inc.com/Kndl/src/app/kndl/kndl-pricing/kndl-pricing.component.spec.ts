import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlPricingComponent } from './kndl-pricing.component';

describe('KndlPricingComponent', () => {
  let component: KndlPricingComponent;
  let fixture: ComponentFixture<KndlPricingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlPricingComponent]
    });
    fixture = TestBed.createComponent(KndlPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
