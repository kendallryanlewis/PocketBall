import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlComponent } from './kndl.component';

describe('KndlComponent', () => {
  let component: KndlComponent;
  let fixture: ComponentFixture<KndlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlComponent]
    });
    fixture = TestBed.createComponent(KndlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
