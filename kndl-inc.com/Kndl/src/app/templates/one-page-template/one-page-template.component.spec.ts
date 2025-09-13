import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnePageTemplateComponent } from './one-page-template.component';

describe('OnePageTemplateComponent', () => {
  let component: OnePageTemplateComponent;
  let fixture: ComponentFixture<OnePageTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnePageTemplateComponent]
    });
    fixture = TestBed.createComponent(OnePageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
