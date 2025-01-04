import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudRoomComponent } from './crud-room.component';

describe('CrudRoomComponent', () => {
  let component: CrudRoomComponent;
  let fixture: ComponentFixture<CrudRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudRoomComponent]
    });
    fixture = TestBed.createComponent(CrudRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
