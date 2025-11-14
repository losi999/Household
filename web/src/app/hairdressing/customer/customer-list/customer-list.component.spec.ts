import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListComponent } from './customer-list.component';
import { MatListModule } from '@angular/material/list';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { By } from '@angular/platform-browser';
import { createStubComponent } from '@household/web/utils/unit-testing';

describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let customers: Customer.Response[];
  const customerListItemStubComponent = createStubComponent('household-customer-list-item', ['customer']);

  beforeEach(async () => {
    customers = [
      testDataFactory.customer.response(),
      testDataFactory.customer.response(),
    ];

    await TestBed.configureTestingModule({
      declarations: [CustomerListComponent],
      imports: [
        MatListModule,
        customerListItemStubComponent,
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    component.customers = customers;
    fixture.detectChanges();
  });

  it('should create a list item component for each customer', () => {
    const items = fixture.debugElement.queryAll(By.directive(customerListItemStubComponent));
    expect(items.length).toEqual(customers.length);
   
    items.forEach((element, i) => {
      expect(element.componentInstance.customer).toEqual(customers[i]);
    });
  });
});
