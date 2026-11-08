import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetails } from './customer-details';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { CustomerDetailsWorks } from '@hairdressing/app/customer/customer-details-works/customer-details-works';
import { CustomerDetailsJobItem } from '@hairdressing/app/customer/customer-details-job-item/customer-details-job-item';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { createStubComponent, elementSelectorFactory, IconText, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

describe('CustomerDetails', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const IconTextStub = createStubComponent(IconText);
  const CustomerDetailsWorksStub = createStubComponent(CustomerDetailsWorks);
  const CustomerDetailsJobItemStub = createStubComponent(CustomerDetailsJobItem);

  let fixture: ComponentFixture<CustomerDetails>;
  let selector: IElementSelector;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  const blacklisted1 = testDataFactory.customer.response();
  const blacklisted2 = testDataFactory.customer.response();
  const customer = testDataFactory.customer.response({
    name: 'Kovács Anna',
    description: 'Törzsvendég',
    rating: 4,
    jobs: [
      testDataFactory.customer.job.response(),
      testDataFactory.customer.job.response(),
    ],
    blacklistedCustomers: [
      blacklisted1,
      blacklisted2,
    ],
  });
  const otherCustomer = testDataFactory.customer.response();

  const past1 = testDataFactory.calendar.entry.response.workBase({
    day: '2000-01-01',
  });
  const past2 = testDataFactory.calendar.entry.response.workBase({
    day: '2000-02-01',
  });
  const upcoming1 = testDataFactory.calendar.entry.response.workBase({
    day: '2999-01-01',
  });
  const upcoming2 = testDataFactory.calendar.entry.response.workBase({
    day: '2999-02-01',
  });

  const works = [
    past1,
    upcoming1,
    past2,
    upcoming2,
  ];

  const getToolbarEditButton = () => {
    return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
  };

  const getName = () => {
    return selector.getElementByTestId('name');
  };

  const getRating = () => {
    return selector.getComponentByTestId('rating');
  };

  const getDescription = () => {
    return selector.getElementByTestId('description');
  };

  const getUpcomingWorks = () => {
    return selector.getComponentByTestId<CustomerDetailsWorks>('upcoming-works');
  };

  const getPastWorks = () => {
    return selector.getComponentByTestId<CustomerDetailsWorks>('past-works');
  };

  const getJobItems = () => {
    return selector.listComponents<CustomerDetailsJobItem>(CustomerDetailsJobItemStub);
  };

  const getNewJobButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('new-job');
  };

  const getAddToBlacklistButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('add-to-blacklist');
  };

  const getEmptyBlacklist = () => {
    return selector.getElementByTestId('empty-blacklist');
  };

  const getBlacklistRows = () => {
    return selector.listComponents(MatIconButton).filter(b => b.nativeElement.classList.contains('danger'));
  };

  const render = async (params?: {
    customerId?: Api.Customer.Id;
    customerList?: Responses.Customer[];
    customerWorks?: Record<Api.Customer.Id, Responses.CalendarEntryWorkLean[]>;
  }) => {
    TestBed.resetTestingModule();

    const customerId = params?.customerId ?? customer.customerId;

    await TestBed.configureTestingModule({
      imports: [CustomerDetails],
      providers: [
        provideMockSignalStore(CustomerStore, 'customerList', 'customerWorks'),
        provideMockDispatcher(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                customerId,
              }),
            },
          },
        },
      ],
    })
      .overrideComponent(CustomerDetails, {
        remove: {
          imports: [
            Toolbar,
            IconText,
            CustomerDetailsWorks,
            CustomerDetailsJobItem,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            IconTextStub,
            CustomerDetailsWorksStub,
            CustomerDetailsJobItemStub,
          ],
        },
      })
      .compileComponents();

    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCustomerStore.customerList.set(params?.customerList ?? [
      otherCustomer,
      customer,
    ]);
    mockCustomerStore.customerWorks.set(params?.customerWorks ?? {
      [customer.customerId]: works,
    });

    fixture = TestBed.createComponent(CustomerDetails);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listCustomersInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, customerApiEvents.listCustomersInitiated(), {
        scope: 'self',
      });
    });

    it('should dispatch listPricesInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, priceApiEvents.listPricesInitiated(), {
        scope: 'self',
      });
    });

    it('should dispatch listCustomerWorksInitiated with the customer of the route', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, customerApiEvents.listCustomerWorksInitiated({
        customerId: customer.customerId,
      }), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Vendégek');
    });
  });

  describe('edit button in toolbar', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('edit');
    });

    it('should dispatch updateCustomer if clicked', async () => {
      await render();

      getToolbarEditButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.updateCustomer(customer), {
        scope: 'self',
      });
    });
  });

  describe('if the customer is not found', () => {
    it('should render nothing but the toolbar', async () => {
      await render({
        customerList: [otherCustomer],
      });

      expect(getName()).toBeFalsy();
      expect(getRating()).toBeFalsy();
      expect(getUpcomingWorks()).toBeFalsy();
      expect(getPastWorks()).toBeFalsy();
      expect(getAddToBlacklistButton()).toBeFalsy();
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(getName().nativeElement.textContent.trim()).toBe(customer.name);
    });
  });

  describe('rating', () => {
    [
      1,
      2,
      3,
      4,
      5,
    ].forEach((rating) => {
      it(`should mark the icon #${rating} as active if the rating is ${rating}`, async () => {
        await render({
          customerList: [
            testDataFactory.customer.response({
              ...customer,
              rating,
            }),
          ],
          customerId: customer.customerId,
        });

        const icons = selector.listComponents(MatIcon, getRating());

        expect(icons.map(i => i.nativeElement.classList.contains('active'))).toEqual([
          1,
          2,
          3,
          4,
          5,
        ].map(r => r === rating));
      });
    });

    it('should render the icons', async () => {
      await render();

      expect(selector.listComponents(MatIcon, getRating()).map(i => i.nativeElement.textContent)).toEqual([
        'sentiment_stressed',
        'sentiment_dissatisfied',
        'sentiment_neutral',
        'sentiment_satisfied',
        'sentiment_excited',
      ]);
    });
  });

  describe('description', () => {
    it('should be rendered', async () => {
      await render();

      expect(getDescription().nativeElement.textContent).toBe(customer.description);
    });

    it('should not be rendered if the customer has none', async () => {
      await render({
        customerList: [
          {
            ...customer,
            description: undefined,
          },
        ],
      });

      expect(getDescription()).toBeFalsy();
    });
  });

  describe('dividers', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.listComponents(MatDivider).length).toBe(3);
    });
  });

  describe('upcoming works', () => {
    it('should be rendered with the upcoming works in reverse order', async () => {
      await render();

      expect(getUpcomingWorks().componentInstance.works()).toEqual([
        upcoming2,
        upcoming1,
      ]);
      expect(getUpcomingWorks().componentInstance.title()).toBe('Következő időpontok');
      expect(getUpcomingWorks().componentInstance.pageSize()).toBe(3);
    });

    it('should be rendered with an empty list if the customer has no works', async () => {
      await render({
        customerWorks: {},
      });

      expect(getUpcomingWorks().componentInstance.works()).toEqual([]);
    });
  });

  describe('past works', () => {
    it('should be rendered with the past works', async () => {
      await render();

      expect(getPastWorks().componentInstance.works()).toEqual([
        past1,
        past2,
      ]);
      expect(getPastWorks().componentInstance.title()).toBe('Korábbi időpontok');
    });

    it('should be rendered with an empty list if the customer has no works', async () => {
      await render({
        customerWorks: {},
      });

      expect(getPastWorks().componentInstance.works()).toEqual([]);
    });
  });

  describe('jobs', () => {
    it('should render a section title', async () => {
      await render();

      expect(selector.listComponents<IconText>(IconTextStub).map(i => i.componentInstance.text())).toEqual([
        'Munkák',
        'Tiltólista',
      ]);
    });

    it('should render a job item for every job', async () => {
      await render();

      expect(getJobItems().map(i => i.componentInstance.job())).toEqual(customer.jobs);
    });

    it('should not render job items if the customer has no jobs', async () => {
      await render({
        customerList: [
          {
            ...customer,
            jobs: [],
          },
        ],
      });

      expect(getJobItems()).toEqual([]);
    });
  });

  describe('new job button', () => {
    it('should dispatch createCustomerJob if clicked', async () => {
      await render();

      getNewJobButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.createCustomerJob({
        customerId: customer.customerId,
      }), {
        scope: 'self',
      });
    });
  });

  describe('blacklist', () => {
    it('should render every blacklisted customer', async () => {
      await render();

      expect(getBlacklistRows().length).toBe(2);
      expect(Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[data-testId="blacklist"] > div')).map(e => e.textContent.trim())).toEqual([
        blacklisted1.name,
        blacklisted2.name,
      ]);
      expect(getEmptyBlacklist()).toBeFalsy();
    });

    it('should render a message if the blacklist is empty', async () => {
      await render({
        customerList: [
          {
            ...customer,
            blacklistedCustomers: [],
          },
        ],
      });

      expect(getEmptyBlacklist().nativeElement.textContent.trim()).toBe('Nincs vendég a tiltólistához adva');
      expect(getBlacklistRows()).toEqual([]);
    });
  });

  describe('add to blacklist button', () => {
    it('should dispatch addCustomerToBlacklist if clicked', async () => {
      await render();

      getAddToBlacklistButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.addCustomerToBlacklist(customer), {
        scope: 'self',
      });
    });
  });

  describe('remove from blacklist button', () => {
    it('should dispatch deleteCustomerFromBlacklist with the clicked customer', async () => {
      await render();

      getBlacklistRows()[1].nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.deleteCustomerFromBlacklist({
        currentCustomer: customer,
        selectedCustomer: blacklisted2,
      }), {
        scope: 'self',
      });
    });
  });
});
