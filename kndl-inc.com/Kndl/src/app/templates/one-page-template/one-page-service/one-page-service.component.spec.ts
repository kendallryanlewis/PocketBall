import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnePageServiceComponent } from './one-page-service.component';

describe('OnePageServiceComponent', () => {
  let component: OnePageServiceComponent;
  let fixture: ComponentFixture<OnePageServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnePageServiceComponent]
    });
    fixture = TestBed.createComponent(OnePageServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
