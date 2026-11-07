import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerJobsHome } from './customer-jobs-home';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { CustomerJobReport } from '@hairdressing/types';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { timeSlotToTimeString } from '@household/shared/common/utils';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { provideRouter } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatRow } from '@angular/material/table';

describe('CustomerJobsHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);

  let fixture: ComponentFixture<CustomerJobsHome>;
  let selector: IElementSelector;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  const price1 = testDataFactory.price.response();
  const price2 = testDataFactory.price.response();

  const job1 = testDataFactory.customer.job.response({
    duration: 6,
    prices: [
      {
        ...price1,
        quantity: 1,
      },
      {
        ...price2,
        quantity: 2,
      },
    ],
  });
  const job2 = testDataFactory.customer.job.response({
    duration: 8,
  });
  const customer1 = testDataFactory.customer.response({
    jobs: [job1],
  });
  const customer2 = testDataFactory.customer.response({
    jobs: [job2],
  });

  const toReport = (customer: Responses.Customer, job: Responses.CustomerJob): CustomerJobReport => {
    const total = job.prices.reduce((sum, p) => sum + p.amount * p.quantity, job.additionalPrice);

    return {
      customerId: customer.customerId,
      customerName: customer.name,
      jobName: job.name,
      duration: job.duration,
      total,
      hourlyRate: total / (job.duration / 4),
      prices: job.prices,
    };
  };

  const report1 = toReport(customer1, job1);
  const report2 = toReport(customer2, job2);

  const getRows = () => {
    return selector.listComponents<MatRow>(MatRow);
  };

  const getCells = (row: number, columnName: string) => {
    return getRows()[row].nativeElement.querySelector(`.mat-column-${columnName}`) as HTMLElement;
  };

  const getPriceButtons = (row: number) => {
    return selector.listComponents<MatButton, HTMLButtonElement>(MatButton, getRows()[row]);
  };

  const getEditButton = (row: number) => {
    return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, getRows()[row]);
  };

  const render = async (params?: {
    jobList?: CustomerJobReport[];
    customerList?: Responses.Customer[];
    priceIdFilters?: Api.Price.Id[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerJobsHome],
      providers: [
        provideMockSignalStore(CustomerStore, 'jobList', 'customerList', 'priceIdFilters'),
        provideMockDispatcher(),
        provideRouter([]),
      ],
    })
      .overrideComponent(CustomerJobsHome, {
        remove: {
          imports: [Toolbar],
        },
        add: {
          imports: [ToolbarStub],
        },
      })
      .compileComponents();

    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCustomerStore.jobList.set(params?.jobList ?? [
      report1,
      report2,
    ]);
    mockCustomerStore.customerList.set(params?.customerList ?? [
      customer1,
      customer2,
    ]);
    mockCustomerStore.priceIdFilters.set(params?.priceIdFilters ?? []);

    fixture = TestBed.createComponent(CustomerJobsHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listCustomersInitiated and listPricesInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, customerApiEvents.listCustomersInitiated(), {
        scope: 'self',
      });
      validateFunctionCall(mockDispatcher.dispatch, priceApiEvents.listPricesInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Munkák');
    });
  });

  describe('table', () => {
    it('should not be rendered if there are no jobs', async () => {
      await render({
        jobList: [],
      });

      expect(getRows()).toEqual([]);
    });

    it('should have a row for every job', async () => {
      await render();

      expect(getRows().length).toBe(2);
    });

    it('should display the customer as a link', async () => {
      await render();

      const link = getCells(0, 'customerName').querySelector('a');

      expect(link.textContent.trim()).toBe(customer1.name);
      expect(link.getAttribute('href')).toBe(`/customers/${customer1.customerId}`);
    });

    it('should display the name of the job', async () => {
      await render();

      expect(getCells(0, 'jobName').textContent.trim()).toBe(job1.name);
    });

    it('should display the duration', async () => {
      await render();

      expect(getCells(0, 'duration').textContent.trim()).toBe(`${timeSlotToTimeString(6)} óra`);
    });

    it('should display the total', async () => {
      await render();

      expect(getCells(0, 'total').textContent.trim()).toBe(`${report1.total} Ft`);
    });

    it('should display the hourly rate', async () => {
      await render({
        jobList: [
          {
            ...report1,
            hourlyRate: 1234.56,
          },
        ],
      });

      expect(getCells(0, 'hourlyRate').textContent.trim()).toBe('1,234.6 Ft/óra');
    });
  });

  describe('price buttons', () => {
    it('should be rendered for every price of the job', async () => {
      await render();

      expect(getPriceButtons(0).map(b => b.nativeElement.textContent)).toEqual([
        expect.stringContaining(price1.name),
        expect.stringContaining(price2.name),
      ]);
    });

    it('should be outlined with add icon if the price is not a filter', async () => {
      await render();

      expect(getPriceButtons(0)[0].nativeElement.classList.contains('mat-mdc-outlined-button')).toBe(true);
      expect(getPriceButtons(0)[0].nativeElement.textContent).toContain('add');
    });

    it('should be filled with remove icon if the price is a filter', async () => {
      await render({
        priceIdFilters: [price1.priceId],
      });

      expect(getPriceButtons(0)[0].nativeElement.classList.contains('mat-mdc-unelevated-button')).toBe(true);
      expect(getPriceButtons(0)[0].nativeElement.textContent).toContain('remove');
      expect(getPriceButtons(0)[1].nativeElement.textContent).toContain('add');
    });

    it('should dispatch addPriceFilter if clicked and the price is not a filter', async () => {
      await render();

      getPriceButtons(0)[1].nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.addPriceFilter({
        priceId: price2.priceId,
      }), {
        scope: 'self',
      });
    });

    it('should dispatch removePriceFilter if clicked and the price is a filter', async () => {
      await render({
        priceIdFilters: [price1.priceId],
      });

      getPriceButtons(0)[0].nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.removePriceFilter({
        priceId: price1.priceId,
      }), {
        scope: 'self',
      });
    });
  });

  describe('edit button', () => {
    it('should dispatch updateCustomerJob with the job of the customer if clicked', async () => {
      await render();

      getEditButton(1).nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.updateCustomerJob({
        customerId: customer2.customerId,
        ...job2,
      }), {
        scope: 'self',
      });
    });
  });

  describe('sorting', () => {
    const getSortHeader = (id: string) => {
      return selector.listComponents<MatSortHeader>(MatSortHeader).find(h => h.componentInstance.id === id);
    };

    it('should dispatch sortJobs ascending after the first click on a header', async () => {
      await render();

      getSortHeader('total').nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.sortJobs({
        sortBy: 'total',
        sortOrder: 'asc',
      }), {
        scope: 'self',
      });
    });

    it('should dispatch sortJobs descending after the second click on a header', async () => {
      await render();

      getSortHeader('duration').nativeElement.click();
      getSortHeader('duration').nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.sortJobs({
        sortBy: 'duration',
        sortOrder: 'desc',
      }), {
        scope: 'self',
      });
    });

    it('should dispatch sortJobs without sorting after the third click on a header', async () => {
      await render();

      getSortHeader('hourlyRate').nativeElement.click();
      getSortHeader('hourlyRate').nativeElement.click();
      getSortHeader('hourlyRate').nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.sortJobs({
        sortBy: undefined,
        sortOrder: undefined,
      }), {
        scope: 'self',
      });
      expect(selector.getComponent(MatSort).injector.get(MatSort).direction).toBe('');
    });
  });
});
