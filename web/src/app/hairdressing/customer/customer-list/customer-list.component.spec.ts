import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { provideRouter } from '@angular/router';
import { CustomerListItemComponent } from '@household/web/app/hairdressing/customer/customer-list-item/customer-list-item.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';

describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;
  let customers: Customer.Response[];
  let selector: IElementSelector;

  beforeEach(async () => {
    customers = [
      testDataFactory.customer.response(),
      testDataFactory.customer.response(),
    ];

    await TestBed.configureTestingModule({
      imports: [CustomerListComponent],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
    component.customers = customers;

    selector = elementSelectorFactory(fixture.debugElement);

    fixture.detectChanges();
  });

  it('should create a list item component for each customer', () => {
    const items = selector.listComponents(CustomerListItemComponent);
    expect(items.length).toEqual(customers.length);
   
    items.forEach((element, i) => {
      expect(element.componentInstance.customer).toEqual(customers[i]);
    });
  });
});
