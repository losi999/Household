import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsJobItem } from './customer-details-job-item';

describe('CustomerDetailsJobItem', () => {
  let component: CustomerDetailsJobItem;
  let fixture: ComponentFixture<CustomerDetailsJobItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsJobItem],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsJobItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
