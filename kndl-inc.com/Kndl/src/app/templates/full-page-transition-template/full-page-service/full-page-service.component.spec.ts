import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageServiceComponent } from './full-page-service.component';

describe('FullPageServiceComponent', () => {
  let component: FullPageServiceComponent;
  let fixture: ComponentFixture<FullPageServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullPageServiceComponent]
    });
    fixture = TestBed.createComponent(FullPageServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
