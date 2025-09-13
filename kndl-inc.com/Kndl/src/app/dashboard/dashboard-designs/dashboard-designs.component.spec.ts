import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDesignsComponent } from './dashboard-designs.component';

describe('DashboardDesignsComponent', () => {
  let component: DashboardDesignsComponent;
  let fixture: ComponentFixture<DashboardDesignsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardDesignsComponent]
    });
    fixture = TestBed.createComponent(DashboardDesignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
