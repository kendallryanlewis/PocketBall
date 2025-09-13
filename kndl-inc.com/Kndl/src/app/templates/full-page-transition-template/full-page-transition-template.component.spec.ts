import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageTransitionTemplateComponent } from './full-page-transition-template.component';

describe('FullPageTransitionTemplateComponent', () => {
  let component: FullPageTransitionTemplateComponent;
  let fixture: ComponentFixture<FullPageTransitionTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullPageTransitionTemplateComponent]
    });
    fixture = TestBed.createComponent(FullPageTransitionTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
