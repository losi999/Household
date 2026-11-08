import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerList } from './customer-list';
import { CustomerListItem } from '@hairdressing/app/customer/customer-list-item/customer-list-item';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';

describe('CustomerList', () => {
  const CustomerListItemStub = createStubComponent(CustomerListItem);

  let fixture: ComponentFixture<CustomerList>;
  let selector: IElementSelector;

  const customers = [
    testDataFactory.customer.response(),
    testDataFactory.customer.response(),
  ];

  const getItems = () => {
    return selector.listComponents<CustomerListItem>(CustomerListItemStub);
  };

  const render = async (customerList: Responses.Customer[] = customers) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerList],
    })
      .overrideComponent(CustomerList, {
        remove: {
          imports: [CustomerListItem],
        },
        add: {
          imports: [CustomerListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerList);
    fixture.componentRef.setInput('customers', customerList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('customer list items', () => {
    it('should be rendered for every customer', async () => {
      await render();

      expect(getItems().map(i => i.componentInstance.customer())).toEqual(customers);
    });

    it('should not be rendered if there are no customers', async () => {
      await render([]);

      expect(getItems()).toEqual([]);
    });
  });
});
