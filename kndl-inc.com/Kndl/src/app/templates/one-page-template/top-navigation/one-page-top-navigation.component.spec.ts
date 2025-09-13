import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnePageTopNavigationComponent } from './one-page-top-navigation.component';

describe('OnePageTopNavigationComponent', () => {
  let component: OnePageTopNavigationComponent;
  let fixture: ComponentFixture<OnePageTopNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnePageTopNavigationComponent]
    });
    fixture = TestBed.createComponent(OnePageTopNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
