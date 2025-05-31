import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRegistrationComponent } from './business-registration.component';

describe('BusinessRegistrationComponent', () => {
  let component: BusinessRegistrationComponent;
  let fixture: ComponentFixture<BusinessRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessRegistrationComponent]
    });
    fixture = TestBed.createComponent(BusinessRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
