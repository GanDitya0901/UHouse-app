import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditonalRequestComponent } from './additonal-request.component';

describe('AdditonalRequestComponent', () => {
  let component: AdditonalRequestComponent;
  let fixture: ComponentFixture<AdditonalRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdditonalRequestComponent]
    });
    fixture = TestBed.createComponent(AdditonalRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
