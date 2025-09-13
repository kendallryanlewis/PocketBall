import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnePageAboutComponent } from './one-page-about.component';

describe('OnePageAboutComponent', () => {
  let component: OnePageAboutComponent;
  let fixture: ComponentFixture<OnePageAboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnePageAboutComponent]
    });
    fixture = TestBed.createComponent(OnePageAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
