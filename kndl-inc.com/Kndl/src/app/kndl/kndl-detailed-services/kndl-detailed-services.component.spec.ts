import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlDetailedServicesComponent } from './kndl-detailed-services.component';

describe('KndlDetailedServicesComponent', () => {
  let component: KndlDetailedServicesComponent;
  let fixture: ComponentFixture<KndlDetailedServicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlDetailedServicesComponent]
    });
    fixture = TestBed.createComponent(KndlDetailedServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
