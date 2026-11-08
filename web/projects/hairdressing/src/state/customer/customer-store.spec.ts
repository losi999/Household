import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from '@hairdressing/services/customer-service';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerState, CustomerStore, provideCustomerStoreInitialState } from '@hairdressing/state/customer/customer-store';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { CustomerJobReport } from '@hairdressing/types';
import { BottomSheetService, DialogService, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { toSearchable } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-customer-reducer.spec.ts,
// with-customer-events.spec.ts, with-customer-api-events.spec.ts). This spec only verifies that the store
// provides its initial state, has every feature wired in and computes the job list.
describe('Customer store', () => {
  let initialState: CustomerState;
  let store: InstanceType<typeof CustomerStore>;
  let dispatcher: Dispatcher;
  let mockCustomerService: MockService<CustomerService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;

  const searchable = (customer: Responses.Customer) => toSearchable(customer, ['name']);

  const setup = (initial?: Partial<CustomerState>) => {
    TestBed.resetTestingModule();

    initialState = {
      customerList: [],
      customerWorks: {},
      isInProgress: [],
      priceIdFilters: [],
      jobListSortBy: undefined,
      jobListSortOrder: undefined,
      ...initial,
    };

    mockCustomerService = createMockService('listCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer', 'listCustomerWorks', 'createCustomerJob', 'updateCustomerJob', 'deleteCustomerJob', 'updateCustomerBlacklist', 'deleteCustomerBlacklist');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        provideCustomerStoreInitialState(initialState),
        provideMockSignalStore(PriceStore, 'priceList'),
      ],
    });

    store = TestBed.inject(CustomerStore);
    dispatcher = TestBed.inject(Dispatcher);
    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
  };

  it('should initialize with the provided state', () => {
    const customerList = [searchable(testDataFactory.customer.response())];
    const isInProgress = [testDataFactory.customer.id()];
    const customerId = testDataFactory.customer.id();
    const customerWorks = {
      [customerId]: [testDataFactory.calendar.entry.response.workBase()],
    };
    const priceIdFilters = [testDataFactory.price.id()];

    setup({
      customerList,
      isInProgress,
      customerWorks,
      priceIdFilters,
      jobListSortBy: 'total',
      jobListSortOrder: 'asc',
    });

    expect(store.customerList()).toEqual(customerList);
    expect(store.isInProgress()).toEqual(isInProgress);
    expect(store.customerWorks()).toEqual(customerWorks);
    expect(store.priceIdFilters()).toEqual(priceIdFilters);
    expect(store.jobListSortBy()).toEqual('total');
    expect(store.jobListSortOrder()).toEqual('asc');
  });

  it('should initialize with the default state', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CustomerService,
          useValue: createMockService('listCustomers').service,
        },
        {
          provide: MatDialog,
          useValue: createMockService('open').service,
        },
        {
          provide: DialogService,
          useValue: createMockService('openConfirmationDialog').service,
        },
        {
          provide: BottomSheetService,
          useValue: createMockService('openBottomSubmenu').service,
        },
        provideCustomerStoreInitialState(),
        provideMockSignalStore(PriceStore, 'priceList'),
      ],
    });

    store = TestBed.inject(CustomerStore);

    expect(store.customerList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
    expect(store.customerWorks()).toEqual({});
    expect(store.priceIdFilters()).toEqual([]);
    expect(store.jobListSortBy()).toBeUndefined();
    expect(store.jobListSortOrder()).toBeUndefined();
    expect(store.jobList()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const customer = testDataFactory.customer.response();

    dispatcher.dispatch(customerApiEvents.listCustomersCompleted([customer]));

    expect(store.customerList()).toEqual([searchable(customer)]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as MatDialogRef<any>);

    dispatcher.dispatch(customerEvents.createCustomer());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should have the API event handlers and the reducer work together', () => {
    setup();
    const customerId = testDataFactory.customer.id();
    const customerRequest = testDataFactory.customer.request();
    mockCustomerService.functions.createCustomer.mockReturnValue(of({
      customerId,
    }));

    dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));

    expect(mockCustomerService.functions.createCustomer).toHaveBeenCalledWith(customerRequest);
    expect(store.customerList()).toEqual([
      searchable({
        customerId,
        ...customerRequest,
        isArchived: false,
        jobs: [],
        blacklistedCustomers: [],
      }),
    ]);
  });

  describe('jobList', () => {
    const createJobReport = (customer: Responses.Customer, job: Responses.CustomerJob): CustomerJobReport => {
      const total = job.prices.reduce((accumulator, p) => accumulator + p.amount * p.quantity, job.additionalPrice ?? 0);

      return {
        customerId: customer.customerId,
        customerName: customer.name,
        jobName: job.name,
        duration: job.duration,
        prices: job.prices,
        total,
        hourlyRate: total / (job.duration / 4),
      };
    };

    it('should list the jobs of the customers', () => {
      const job = testDataFactory.customer.job.response();
      const customer = testDataFactory.customer.response({
        jobs: [job],
      });

      setup({
        customerList: [searchable(customer)],
      });

      expect(store.jobList()).toEqual([createJobReport(customer, job)]);
    });

    it('should skip the jobs of archived customers', () => {
      const customer = testDataFactory.customer.response({
        jobs: [testDataFactory.customer.job.response()],
        isArchived: true,
      });

      setup({
        customerList: [searchable(customer)],
      });

      expect(store.jobList()).toEqual([]);
    });

    it('should use only the additional price as total if a job has no prices', () => {
      const job = testDataFactory.customer.job.response({
        prices: [],
        additionalPrice: 1000,
      });
      const customer = testDataFactory.customer.response({
        jobs: [job],
      });

      setup({
        customerList: [searchable(customer)],
      });

      expect(store.jobList()).toEqual([
        expect.objectContaining({
          total: 1000,
        }),
      ]);
    });

    it('should update when a job is created', () => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      });
      const priceResponse = testDataFactory.price.response();
      const quantity = 4;
      const jobRequest = testDataFactory.customer.job.request({
        prices: [
          {
            priceId: priceResponse.priceId,
            quantity,
          },
        ],
      });
      const total = priceResponse.amount * quantity + jobRequest.additionalPrice;
      setup({
        customerList: [searchable(originalCustomer)],
      });

      dispatcher.dispatch(customerApiEvents.createCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        priceList: [priceResponse],
      }));

      expect(store.jobList()).toEqual([
        {
          customerId: originalCustomer.customerId,
          customerName: originalCustomer.name,
          duration: jobRequest.duration,
          jobName: jobRequest.name,
          hourlyRate: total / (jobRequest.duration / 4),
          prices: [
            {
              ...priceResponse,
              quantity,
            },
          ],
          total,
        },
      ]);
    });

    it('should update when a job is updated', () => {
      const originalJob = testDataFactory.customer.job.response();
      const originalCustomer = testDataFactory.customer.response({
        jobs: [originalJob],
      });
      const priceResponse = testDataFactory.price.response();
      const quantity = 4;
      const jobRequest = testDataFactory.customer.job.request({
        prices: [
          {
            priceId: priceResponse.priceId,
            quantity,
          },
        ],
      });
      const total = priceResponse.amount * quantity + jobRequest.additionalPrice;
      setup({
        customerList: [searchable(originalCustomer)],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        jobName: originalJob.name,
        priceList: [priceResponse],
      }));

      expect(store.jobList()).toEqual([
        {
          customerId: originalCustomer.customerId,
          customerName: originalCustomer.name,
          duration: jobRequest.duration,
          jobName: jobRequest.name,
          hourlyRate: total / (jobRequest.duration / 4),
          prices: [
            {
              ...priceResponse,
              quantity,
            },
          ],
          total,
        },
      ]);
    });

    describe('with price filters', () => {
      const quantity = 2;
      const price = testDataFactory.price.response();
      const job = testDataFactory.customer.job.response({
        prices: [
          {
            ...price,
            quantity,
          },
        ],
      });
      const customer = testDataFactory.customer.response({
        jobs: [
          job,
          testDataFactory.customer.job.response(),
        ],
      });

      it('should list only the jobs with the filtered price after adding a filter', () => {
        setup({
          customerList: [searchable(customer)],
        });

        dispatcher.dispatch(customerEvents.addPriceFilter({
          priceId: price.priceId,
        }));

        expect(store.priceIdFilters()).toEqual([price.priceId]);
        expect(store.jobList()).toEqual([createJobReport(customer, job)]);
      });

      it('should list every job after removing the filter', () => {
        setup({
          customerList: [searchable(customer)],
          priceIdFilters: [price.priceId],
        });

        dispatcher.dispatch(customerEvents.removePriceFilter({
          priceId: price.priceId,
        }));

        expect(store.priceIdFilters()).toEqual([]);
        expect(store.jobList()).toEqual(customer.jobs.map(j => createJobReport(customer, j)));
      });
    });

    describe('with sorting', () => {
      let jobA: Responses.CustomerJob;
      let jobB: Responses.CustomerJob;

      beforeEach(() => {
        jobA = testDataFactory.customer.job.response({
          duration: 1,
          additionalPrice: 0,
          prices: [
            {
              ...testDataFactory.price.response({
                amount: 4000,
              }),
              quantity: 1,
            },
          ],
        });
        jobB = testDataFactory.customer.job.response({
          duration: 2,
          additionalPrice: 0,
          prices: [
            {
              ...testDataFactory.price.response({
                amount: 4500,
              }),
              quantity: 2,
            },
          ],
        });
        const customer = testDataFactory.customer.response({
          jobs: [
            jobA,
            jobB,
          ],
        });

        setup({
          customerList: [searchable(customer)],
        });
      });

      it.each([
        [
          'duration',
          'desc',
          'B',
          'A',
        ],
        [
          'duration',
          'asc',
          'A',
          'B',
        ],
        [
          'total',
          'desc',
          'B',
          'A',
        ],
        [
          'total',
          'asc',
          'A',
          'B',
        ],
        [
          'hourlyRate',
          'desc',
          'B',
          'A',
        ],
        [
          'hourlyRate',
          'asc',
          'A',
          'B',
        ],
      ] as const)('should sort by %s %s', (sortBy, sortOrder, first, second) => {
        const jobs = {
          A: jobA,
          B: jobB,
        };

        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy,
          sortOrder,
        }));

        expect(store.jobList()).toEqual([
          expect.objectContaining({
            jobName: jobs[first].name,
          }),
          expect.objectContaining({
            jobName: jobs[second].name,
          }),
        ]);
      });

      it('should keep the original order if only the sort order is missing', () => {
        expect(store.jobList()).toEqual([
          expect.objectContaining({
            jobName: jobA.name,
          }),
          expect.objectContaining({
            jobName: jobB.name,
          }),
        ]);
      });
    });
  });

  it('should provide the mocked price store', () => {
    setup();
    const priceResponse = testDataFactory.price.response();

    mockPriceStore.priceList.set([priceResponse]);

    expect(TestBed.inject(PriceStore).priceList()).toEqual([priceResponse]);
  });
});
