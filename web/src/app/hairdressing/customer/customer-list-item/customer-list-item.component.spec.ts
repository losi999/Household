import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Customer } from '@household/shared/types/types';
import { CustomerListItemComponent } from '@household/web/app/hairdressing/customer/customer-list-item/customer-list-item.component';
import { IElementSelector, elementSelectorFactory } from '@household/web/testing/element-selector';

describe('CustomerListItemComponent', () => {
  let component: CustomerListItemComponent;
  let fixture: ComponentFixture<CustomerListItemComponent>;
  let customer: Customer.Response;
  let selector: IElementSelector;

  beforeEach(async () => {
    customer = testDataFactory.customer.response();

    await TestBed.configureTestingModule({
      imports: [CustomerListItemComponent],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerListItemComponent);
    component = fixture.componentInstance;
    component.customer = customer;
    
    selector = elementSelectorFactory(fixture.debugElement);
    fixture.detectChanges();
  });

  it('should contain a link to customer details page', () => {
    const link = selector.getComponent(RouterLink);
    expect(link.attributes.href).toContain(customer.customerId);
  });

  it('should display customer name', () => {
    const link = selector.getComponent(RouterLink);
    expect(link.nativeElement.textContent).toEqual(customer.name);
  });
});
