import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageTransitiontopNavigationComponent } from './full-page-transitiontop-navigation.component';

describe('FullPageTransitiontopNavigationComponent', () => {
  let component: FullPageTransitiontopNavigationComponent;
  let fixture: ComponentFixture<FullPageTransitiontopNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullPageTransitiontopNavigationComponent]
    });
    fixture = TestBed.createComponent(FullPageTransitiontopNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
