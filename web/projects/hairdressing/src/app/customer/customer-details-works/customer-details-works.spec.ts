import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsWorks } from './customer-details-works';

describe('CustomerDetailsWorks', () => {
  let component: CustomerDetailsWorks;
  let fixture: ComponentFixture<CustomerDetailsWorks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsWorks],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsWorks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
