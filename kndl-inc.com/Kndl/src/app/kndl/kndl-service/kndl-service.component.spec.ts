import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KndlServiceComponent } from './kndl-service.component';

describe('ServiceComponent', () => {
  let component: KndlServiceComponent;
  let fixture: ComponentFixture<KndlServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlServiceComponent]
    });
    fixture = TestBed.createComponent(KndlServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
