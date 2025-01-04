import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FasiitiesAdminServiceComponent } from './fasiities-admin-service.component';

describe('FasiitiesAdminServiceComponent', () => {
  let component: FasiitiesAdminServiceComponent;
  let fixture: ComponentFixture<FasiitiesAdminServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FasiitiesAdminServiceComponent]
    });
    fixture = TestBed.createComponent(FasiitiesAdminServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
