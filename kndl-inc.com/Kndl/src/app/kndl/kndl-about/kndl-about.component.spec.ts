import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KndlAboutComponent } from './kndl-about.component';


describe('AboutComponent', () => {
  let component: KndlAboutComponent;
  let fixture: ComponentFixture<KndlAboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlAboutComponent]
    });
    fixture = TestBed.createComponent(KndlAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
