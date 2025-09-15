import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlCallToActionComponent } from './kndl-call-to-action.component';

describe('KndlCallToActionComponent', () => {
  let component: KndlCallToActionComponent;
  let fixture: ComponentFixture<KndlCallToActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlCallToActionComponent]
    });
    fixture = TestBed.createComponent(KndlCallToActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
