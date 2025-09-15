import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingCalanderComponent } from './scheduling-calander.component';

describe('SchedulingCalanderComponent', () => {
  let component: SchedulingCalanderComponent;
  let fixture: ComponentFixture<SchedulingCalanderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchedulingCalanderComponent]
    });
    fixture = TestBed.createComponent(SchedulingCalanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
