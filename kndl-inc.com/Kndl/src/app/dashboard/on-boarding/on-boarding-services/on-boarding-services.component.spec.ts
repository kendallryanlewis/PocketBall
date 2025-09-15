import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingServicesComponent } from './on-boarding-services.component';

describe('OnBoardingServicesComponent', () => {
  let component: OnBoardingServicesComponent;
  let fixture: ComponentFixture<OnBoardingServicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnBoardingServicesComponent]
    });
    fixture = TestBed.createComponent(OnBoardingServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
