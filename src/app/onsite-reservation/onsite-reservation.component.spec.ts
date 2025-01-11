import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnsiteReservationComponent } from './onsite-reservation.component';

describe('OnsiteReservationComponent', () => {
  let component: OnsiteReservationComponent;
  let fixture: ComponentFixture<OnsiteReservationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnsiteReservationComponent]
    });
    fixture = TestBed.createComponent(OnsiteReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
