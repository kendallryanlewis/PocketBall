import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlAddOnsComponent } from './kndl-add-ons.component';

describe('KndlAddOnsComponent', () => {
  let component: KndlAddOnsComponent;
  let fixture: ComponentFixture<KndlAddOnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlAddOnsComponent]
    });
    fixture = TestBed.createComponent(KndlAddOnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
