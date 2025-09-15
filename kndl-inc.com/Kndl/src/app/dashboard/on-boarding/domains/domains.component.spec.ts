import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainsComponent } from './domains.component';

describe('DomainsComponent', () => {
  let component: DomainsComponent;
  let fixture: ComponentFixture<DomainsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DomainsComponent]
    });
    fixture = TestBed.createComponent(DomainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
