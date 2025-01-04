import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomAvailabilityComponent } from './manage-room-availability.component';

describe('ManageRoomAvailabilityComponent', () => {
  let component: ManageRoomAvailabilityComponent;
  let fixture: ComponentFixture<ManageRoomAvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRoomAvailabilityComponent]
    });
    fixture = TestBed.createComponent(ManageRoomAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
