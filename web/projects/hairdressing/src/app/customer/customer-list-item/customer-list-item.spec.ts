import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerListItem } from './customer-list-item';

describe('CustomerListItem', () => {
  let component: CustomerListItem;
  let fixture: ComponentFixture<CustomerListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerListItem],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
