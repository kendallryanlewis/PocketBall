import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlAboutUsComponent } from './kndl-about-us.component';

describe('KndlAboutUsComponent', () => {
  let component: KndlAboutUsComponent;
  let fixture: ComponentFixture<KndlAboutUsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlAboutUsComponent]
    });
    fixture = TestBed.createComponent(KndlAboutUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
