import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListItem } from './customer-list-item';
import { createStubComponent, elementSelectorFactory, IconText, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { customerEvents } from '@hairdressing/state/customer/customer-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { provideRouter } from '@angular/router';
import { MatCard, MatCardActions, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { timeSlotToTimeString } from '@household/shared/common/utils';
import { MatButton, MatIconButton } from '@angular/material/button';

describe('CustomerListItem', () => {
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<CustomerListItem>;
  let selector: IElementSelector;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  const customer = testDataFactory.customer.response();

  const getCard = () => {
    return selector.getComponent<MatCard>(MatCard);
  };

  const getJobItems = () => {
    return selector.listComponents<MatListItem, HTMLAnchorElement>(MatListItem);
  };

  const getDetailsButton = () => {
    return selector.getComponent<MatButton, HTMLAnchorElement>(MatButton);
  };

  const getDeleteButton = () => {
    return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, selector.getComponent(MatCardActions));
  };

  const render = async (params?: {
    customer?: Responses.Customer;
    isInProgress?: Api.Customer.Id[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerListItem],
      providers: [
        provideMockSignalStore(CustomerStore, 'isInProgress'),
        provideMockDispatcher(),
        provideRouter([]),
      ],
    })
      .overrideComponent(CustomerListItem, {
        remove: {
          imports: [IconText],
        },
        add: {
          imports: [IconTextStub],
        },
      })
      .compileComponents();

    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCustomerStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(CustomerListItem);
    fixture.componentRef.setInput('customer', params?.customer ?? customer);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatCardTitle).nativeElement.textContent.trim()).toBe(customer.name);
    });
  });

  describe('description', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatCardSubtitle).nativeElement.textContent.trim()).toBe(customer.description);
    });
  });

  describe('card', () => {
    it('should not be archived for an active customer', async () => {
      await render();

      expect(getCard().nativeElement.classList.contains('archived')).toBe(false);
    });

    it('should be archived for an archived customer', async () => {
      await render({
        customer: testDataFactory.customer.response({
          isArchived: true,
        }),
      });

      expect(getCard().nativeElement.classList.contains('archived')).toBe(true);
    });
  });

  describe('job list', () => {
    it('should be rendered with a title and every job', async () => {
      const job1 = testDataFactory.customer.job.response({
        duration: 5,
      });
      const job2 = testDataFactory.customer.job.response({
        duration: 8,
      });

      await render({
        customer: testDataFactory.customer.response({
          jobs: [
            job1,
            job2,
          ],
        }),
      });

      expect(selector.getComponent<IconText>(IconTextStub).componentInstance.text()).toBe('Munkák');
      expect(selector.listComponents(MatListItemTitle).map(i => i.nativeElement.textContent)).toEqual([
        job1.name,
        job2.name,
      ]);
      expect(selector.listComponents(MatListItemLine).map(i => i.nativeElement.textContent)).toEqual([
        `${timeSlotToTimeString(5)} óra`,
        `${timeSlotToTimeString(8)} óra`,
      ]);
    });

    it('should not be rendered if the customer has no jobs', async () => {
      await render({
        customer: testDataFactory.customer.response({
          jobs: [],
        }),
      });

      expect(selector.getComponent(IconTextStub)).toBeFalsy();
      expect(getJobItems()).toEqual([]);
    });

    it('should link to the calendar with the customer and the job', async () => {
      await render();

      const href = new URL(getJobItems()[0].nativeElement.href);

      expect(href.pathname).toBe('/');
      expect(href.searchParams.get('customerId')).toBe(customer.customerId);
      expect(href.searchParams.get('jobName')).toBe(customer.jobs[0].name);
    });

    it('should be disabled if the customer is in progress', async () => {
      await render({
        isInProgress: [customer.customerId],
      });

      expect(getJobItems()[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('details button', () => {
    it('should link to the customer', async () => {
      await render();

      expect(getDetailsButton().nativeElement.getAttribute('href')).toBe(`/${customer.customerId}`);
      expect(getDetailsButton().nativeElement.textContent.trim()).toBe('Részletek');
    });

    it('should be enabled if the customer is not in progress', async () => {
      await render();

      expect(getDetailsButton().nativeElement.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('should be disabled if the customer is in progress', async () => {
      await render({
        isInProgress: [customer.customerId],
      });

      expect(getDetailsButton().nativeElement.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('delete button', () => {
    it('should be rendered for an active customer', async () => {
      await render();

      expect(getDeleteButton().nativeElement.disabled).toBe(false);
    });

    it('should not be rendered for an archived customer', async () => {
      await render({
        customer: testDataFactory.customer.response({
          isArchived: true,
        }),
      });

      expect(getDeleteButton()).toBeFalsy();
    });

    it('should be disabled if the customer is in progress', async () => {
      await render({
        isInProgress: [customer.customerId],
      });

      expect(getDeleteButton().nativeElement.disabled).toBe(true);
    });

    it('should dispatch deleteCustomer if clicked', async () => {
      await render();

      getDeleteButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.deleteCustomer(customer), {
        scope: 'self',
      });
    });

    it('should not dispatch anything if disabled', async () => {
      await render({
        isInProgress: [customer.customerId],
      });

      getDeleteButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch);
    });
  });
});
