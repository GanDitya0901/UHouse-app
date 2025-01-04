import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePaymentComponent } from './manage-payment.component';

describe('ManagePaymentComponent', () => {
  let component: ManagePaymentComponent;
  let fixture: ComponentFixture<ManagePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagePaymentComponent]
    });
    fixture = TestBed.createComponent(ManagePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
