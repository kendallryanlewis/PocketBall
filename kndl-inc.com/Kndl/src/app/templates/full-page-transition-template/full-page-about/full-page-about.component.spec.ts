import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageAboutComponent } from './full-page-about.component';

describe('FullPageAboutComponent', () => {
  let component: FullPageAboutComponent;
  let fixture: ComponentFixture<FullPageAboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullPageAboutComponent]
    });
    fixture = TestBed.createComponent(FullPageAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
