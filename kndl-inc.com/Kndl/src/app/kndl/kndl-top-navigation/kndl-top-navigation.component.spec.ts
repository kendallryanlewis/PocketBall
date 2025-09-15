import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KndlTopNavigationComponent } from './kndl-top-navigation.component';


describe('TopNavigationComponent', () => {
  let component: KndlTopNavigationComponent;
  let fixture: ComponentFixture<KndlTopNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlTopNavigationComponent]
    });
    fixture = TestBed.createComponent(KndlTopNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
