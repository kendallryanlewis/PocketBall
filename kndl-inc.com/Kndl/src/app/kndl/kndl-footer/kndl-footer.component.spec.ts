import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KndlFooterComponent } from './kndl-footer.component';

describe('KndlFooterComponent', () => {
  let component: KndlFooterComponent;
  let fixture: ComponentFixture<KndlFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KndlFooterComponent]
    });
    fixture = TestBed.createComponent(KndlFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
