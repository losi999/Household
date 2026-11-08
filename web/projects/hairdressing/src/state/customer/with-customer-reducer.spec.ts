import { TestBed } from '@angular/core/testing';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerState } from '@hairdressing/state/customer/customer-store';
import { withCustomerReducer } from '@hairdressing/state/customer/with-customer-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { toSearchable } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';

const createTestStore = (state: CustomerState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<CustomerState>(state), withCustomerReducer());
};

describe('withCustomerReducer', () => {
  let initialState: CustomerState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const searchable = (customer: Responses.Customer) => toSearchable(customer, ['name']);

  const validateState = (currentValue?: Partial<CustomerState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.customerList(), 'customerList').toEqual(Object.hasOwn(currentValue ?? {}, 'customerList') ? currentValue.customerList : initialState.customerList);
    expect(store.customerWorks(), 'customerWorks').toEqual(Object.hasOwn(currentValue ?? {}, 'customerWorks') ? currentValue.customerWorks : initialState.customerWorks);
    expect(store.priceIdFilters(), 'priceIdFilters').toEqual(Object.hasOwn(currentValue ?? {}, 'priceIdFilters') ? currentValue.priceIdFilters : initialState.priceIdFilters);
    expect(store.jobListSortBy(), 'jobListSortBy').toEqual(Object.hasOwn(currentValue ?? {}, 'jobListSortBy') ? currentValue.jobListSortBy : initialState.jobListSortBy);
    expect(store.jobListSortOrder(), 'jobListSortOrder').toEqual(Object.hasOwn(currentValue ?? {}, 'jobListSortOrder') ? currentValue.jobListSortOrder : initialState.jobListSortOrder);
  };

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

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listCustomersCompleted', () => {
    it('should store the customers with their search terms', () => {
      const customer = testDataFactory.customer.response({
        name: 'ékezetes név',
        jobs: [],
      });

      dispatcher.dispatch(customerApiEvents.listCustomersCompleted([customer]));

      validateState({
        customerList: [
          {
            ...customer,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should replace the existing customers', () => {
      setup({
        customerList: [searchable(testDataFactory.customer.response())],
      });
      const customer = testDataFactory.customer.response();

      dispatcher.dispatch(customerApiEvents.listCustomersCompleted([customer]));

      validateState({
        customerList: [searchable(customer)],
      });
    });
  });

  describe('createCustomerCompleted', () => {
    it('should add the customer with its search terms', () => {
      const customerId = testDataFactory.customer.id();
      const customerRequest = testDataFactory.customer.request({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(customerApiEvents.createCustomerCompleted({
        customerId,
        ...customerRequest,
      }));

      validateState({
        customerList: [
          {
            customerId,
            ...customerRequest,
            isArchived: false,
            jobs: [],
            blacklistedCustomers: [],
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should keep the customers ordered by name', () => {
      const lastCustomer = searchable(testDataFactory.customer.response({
        name: 'Zsolt',
        jobs: [],
      }));
      setup({
        customerList: [lastCustomer],
      });
      const customerId = testDataFactory.customer.id();
      const customerRequest = testDataFactory.customer.request({
        name: 'Ádám',
      });

      dispatcher.dispatch(customerApiEvents.createCustomerCompleted({
        customerId,
        ...customerRequest,
      }));

      validateState({
        customerList: [
          searchable({
            customerId,
            ...customerRequest,
            isArchived: false,
            jobs: [],
            blacklistedCustomers: [],
          }),
          lastCustomer,
        ],
      });
    });
  });

  describe('updateCustomerInitiated', () => {
    it('should mark the customer as in progress', () => {
      const otherCustomerId = testDataFactory.customer.id();
      setup({
        isInProgress: [otherCustomerId],
      });
      const customerId = testDataFactory.customer.id();

      dispatcher.dispatch(customerApiEvents.updateCustomerInitiated({
        customerId,
        ...testDataFactory.customer.request(),
      }));

      validateState({
        isInProgress: [
          otherCustomerId,
          customerId,
        ],
      });
    });
  });

  describe('deleteCustomerInitiated', () => {
    it('should mark the customer as in progress', () => {
      const otherCustomerId = testDataFactory.customer.id();
      setup({
        isInProgress: [otherCustomerId],
      });
      const customerId = testDataFactory.customer.id();

      dispatcher.dispatch(customerApiEvents.deleteCustomerInitiated({
        customerId,
      }));

      validateState({
        isInProgress: [
          otherCustomerId,
          customerId,
        ],
      });
    });
  });

  describe('updateCustomerCompleted', () => {
    it('should update the customer with its search terms and remove it from in progress', () => {
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
      }));
      const otherCustomer = searchable(testDataFactory.customer.response({
        name: 'Zsolt',
        jobs: [],
      }));
      const otherCustomerId = testDataFactory.customer.id();
      setup({
        customerList: [
          originalCustomer,
          otherCustomer,
        ],
        isInProgress: [
          originalCustomer.customerId,
          otherCustomerId,
        ],
      });
      const customerRequest = testDataFactory.customer.request({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerCompleted({
        customerId: originalCustomer.customerId,
        ...customerRequest,
      }));

      validateState({
        isInProgress: [otherCustomerId],
        customerList: [
          {
            ...originalCustomer,
            ...customerRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
          otherCustomer,
        ],
      });
    });

    it('should keep the customers ordered by name', () => {
      const firstCustomer = searchable(testDataFactory.customer.response({
        name: 'Ádám',
        jobs: [],
      }));
      const secondCustomer = searchable(testDataFactory.customer.response({
        name: 'Béla',
        jobs: [],
      }));
      setup({
        customerList: [
          firstCustomer,
          secondCustomer,
        ],
        isInProgress: [firstCustomer.customerId],
      });
      const customerRequest = testDataFactory.customer.request({
        name: 'Zsolt',
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerCompleted({
        customerId: firstCustomer.customerId,
        ...customerRequest,
      }));

      validateState({
        isInProgress: [],
        customerList: [
          secondCustomer,
          searchable({
            ...firstCustomer,
            ...customerRequest,
          }),
        ],
      });
    });
  });

  describe('updateCustomerFailed', () => {
    it('should remove the customer from in progress', () => {
      const customerId = testDataFactory.customer.id();
      const otherCustomerId = testDataFactory.customer.id();
      setup({
        isInProgress: [
          customerId,
          otherCustomerId,
        ],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerFailed({
        customerId,
      }));

      validateState({
        isInProgress: [otherCustomerId],
      });
    });
  });

  describe('deleteCustomerCompleted', () => {
    it('should archive the customer and remove it from in progress', () => {
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
        isArchived: false,
        blacklistedCustomers: [],
      }));
      setup({
        customerList: [originalCustomer],
        isInProgress: [originalCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerCompleted({
        customerId: originalCustomer.customerId,
      }));

      validateState({
        isInProgress: [],
        customerList: [
          {
            ...originalCustomer,
            isArchived: true,
          },
        ],
      });
    });

    it('should remove the customer from the blacklist of the others', () => {
      const deletedCustomer = testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [],
      });
      const otherCustomerId = testDataFactory.customer.id();
      const blacklistingCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [
          deletedCustomer,
          testDataFactory.customer.response({
            customerId: otherCustomerId,
          }),
        ],
      }));
      const unrelatedCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [],
      }));
      setup({
        customerList: [
          searchable(deletedCustomer),
          blacklistingCustomer,
          unrelatedCustomer,
        ],
        isInProgress: [deletedCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerCompleted({
        customerId: deletedCustomer.customerId,
      }));

      validateState({
        isInProgress: [],
        customerList: [
          {
            ...searchable(deletedCustomer),
            isArchived: true,
          },
          {
            ...blacklistingCustomer,
            blacklistedCustomers: blacklistingCustomer.blacklistedCustomers.filter(c => c.customerId === otherCustomerId),
          },
          unrelatedCustomer,
        ],
      });
    });
  });

  describe('deleteCustomerFailed', () => {
    it('should remove the customer from in progress', () => {
      const customerId = testDataFactory.customer.id();
      const otherCustomerId = testDataFactory.customer.id();
      setup({
        isInProgress: [
          customerId,
          otherCustomerId,
        ],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerFailed({
        customerId,
      }));

      validateState({
        isInProgress: [otherCustomerId],
      });
    });
  });

  describe('createCustomerJobCompleted', () => {
    const priceResponse = testDataFactory.price.response();
    const quantity = 4;

    it('should add the job with its prices to the customer', () => {
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
        isGroup: false,
      }));
      const otherCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
      }));
      setup({
        customerList: [
          originalCustomer,
          otherCustomer,
        ],
      });
      const jobRequest = testDataFactory.customer.job.request({
        prices: [
          {
            priceId: priceResponse.priceId,
            quantity,
          },
        ],
      });

      dispatcher.dispatch(customerApiEvents.createCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        priceList: [priceResponse],
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [
              {
                ...jobRequest,
                prices: [
                  {
                    ...priceResponse,
                    quantity,
                  },
                ],
                title: `${originalCustomer.name}: ${jobRequest.name}`,
              },
            ],
          },
          otherCustomer,
        ],
      });
    });

    it('should use only the job name as title if the customer is a group', () => {
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
        isGroup: true,
      }));
      setup({
        customerList: [originalCustomer],
      });
      const jobRequest = testDataFactory.customer.job.request({
        prices: [
          {
            priceId: priceResponse.priceId,
            quantity,
          },
        ],
      });

      dispatcher.dispatch(customerApiEvents.createCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        priceList: [priceResponse],
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [
              {
                ...jobRequest,
                prices: [
                  {
                    ...priceResponse,
                    quantity,
                  },
                ],
                title: jobRequest.name,
              },
            ],
          },
        ],
      });
    });

    it('should keep the jobs ordered by name', () => {
      const lastJob = testDataFactory.customer.job.response({
        name: 'Zsolt',
      });
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [lastJob],
        isGroup: true,
      }));
      setup({
        customerList: [originalCustomer],
      });
      const jobRequest = testDataFactory.customer.job.request({
        body: {
          name: 'Ádám',
        },
        prices: [],
      });

      dispatcher.dispatch(customerApiEvents.createCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        priceList: [],
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [
              {
                ...jobRequest,
                prices: [],
                title: jobRequest.name,
              },
              lastJob,
            ],
          },
        ],
      });
    });
  });

  describe('updateCustomerJobCompleted', () => {
    const priceResponse = testDataFactory.price.response();
    const quantity = 4;

    it('should replace the job of the customer', () => {
      const originalJob = testDataFactory.customer.job.response({
        name: 'Első',
      });
      const otherJob = testDataFactory.customer.job.response({
        name: 'Második',
      });
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [
          originalJob,
          otherJob,
        ],
        isGroup: false,
      }));
      const otherCustomer = searchable(testDataFactory.customer.response({
        jobs: [originalJob],
      }));
      setup({
        customerList: [
          originalCustomer,
          otherCustomer,
        ],
      });
      const jobRequest = testDataFactory.customer.job.request({
        body: {
          name: 'Harmadik',
        },
        prices: [
          {
            priceId: priceResponse.priceId,
            quantity,
          },
        ],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        jobName: originalJob.name,
        ...jobRequest,
        priceList: [priceResponse],
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [
              {
                ...jobRequest,
                prices: [
                  {
                    ...priceResponse,
                    quantity,
                  },
                ],
                title: `${originalCustomer.name}: ${jobRequest.name}`,
              },
              otherJob,
            ],
          },
          otherCustomer,
        ],
      });
    });

    it('should use only the job name as title if the customer is a group', () => {
      const originalJob = testDataFactory.customer.job.response();
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [originalJob],
        isGroup: true,
      }));
      setup({
        customerList: [originalCustomer],
      });
      const jobRequest = testDataFactory.customer.job.request({
        prices: [],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        jobName: originalJob.name,
        ...jobRequest,
        priceList: [],
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [
              {
                ...jobRequest,
                prices: [],
                title: jobRequest.name,
              },
            ],
          },
        ],
      });
    });
  });

  describe('deleteCustomerJobCompleted', () => {
    it('should remove the job from the customer', () => {
      const originalJob = testDataFactory.customer.job.response();
      const otherJob = testDataFactory.customer.job.response();
      const originalCustomer = searchable(testDataFactory.customer.response({
        jobs: [
          originalJob,
          otherJob,
        ],
      }));
      const otherCustomer = searchable(testDataFactory.customer.response({
        jobs: [originalJob],
      }));
      setup({
        customerList: [
          originalCustomer,
          otherCustomer,
        ],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        jobName: originalJob.name,
      }));

      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [otherJob],
          },
          otherCustomer,
        ],
      });
    });
  });

  describe('listCustomerWorksCompleted', () => {
    it('should store the works of the customer', () => {
      const customerId = testDataFactory.customer.id();
      const workEntry = testDataFactory.calendar.entry.response.workBase();

      dispatcher.dispatch(customerApiEvents.listCustomerWorksCompleted({
        customerId,
        works: [workEntry],
      }));

      validateState({
        customerWorks: {
          [customerId]: [workEntry],
        },
      });
    });

    it('should keep the works of the other customers', () => {
      const otherCustomerId = testDataFactory.customer.id();
      const otherWork = testDataFactory.calendar.entry.response.workBase();
      setup({
        customerWorks: {
          [otherCustomerId]: [otherWork],
        },
      });
      const customerId = testDataFactory.customer.id();
      const workEntry = testDataFactory.calendar.entry.response.workBase();

      dispatcher.dispatch(customerApiEvents.listCustomerWorksCompleted({
        customerId,
        works: [workEntry],
      }));

      validateState({
        customerWorks: {
          [otherCustomerId]: [otherWork],
          [customerId]: [workEntry],
        },
      });
    });
  });

  describe('addCustomerToBlacklistCompleted', () => {
    it('should add each customer to the blacklist of the other', () => {
      const customerA = testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [],
      });
      const customerB = testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [],
      });
      const customerC = searchable(testDataFactory.customer.response({
        jobs: [],
      }));
      setup({
        customerList: [
          searchable(customerA),
          searchable(customerB),
          customerC,
        ],
      });

      dispatcher.dispatch(customerApiEvents.addCustomerToBlacklistCompleted([
        customerA,
        customerB,
      ]));

      validateState({
        customerList: [
          {
            ...searchable(customerA),
            blacklistedCustomers: [customerB],
          },
          {
            ...searchable(customerB),
            blacklistedCustomers: [customerA],
          },
          customerC,
        ],
      });
    });
  });

  describe('deleteCustomerFromBlacklistCompleted', () => {
    it('should remove each customer from the blacklist of the other', () => {
      const customerA = testDataFactory.customer.response({
        jobs: [],
      });
      const customerB = testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [customerA],
      });
      const customerC = testDataFactory.customer.response({
        jobs: [],
      });
      customerA.blacklistedCustomers = [
        customerB,
        customerC,
      ];
      const unrelatedCustomer = searchable(testDataFactory.customer.response({
        jobs: [],
      }));
      setup({
        customerList: [
          searchable(customerA),
          searchable(customerB),
          unrelatedCustomer,
        ],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerFromBlacklistCompleted([
        customerA.customerId,
        customerB.customerId,
      ]));

      validateState({
        customerList: [
          {
            ...searchable(customerA),
            blacklistedCustomers: [customerC],
          },
          {
            ...searchable(customerB),
            blacklistedCustomers: [],
          },
          unrelatedCustomer,
        ],
      });
    });
  });

  describe('addPriceFilter', () => {
    it('should add the price to the filters', () => {
      const existingPriceId = testDataFactory.price.id();
      setup({
        priceIdFilters: [existingPriceId],
      });
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(customerEvents.addPriceFilter({
        priceId,
      }));

      validateState({
        priceIdFilters: [
          existingPriceId,
          priceId,
        ],
      });
    });
  });

  describe('removePriceFilter', () => {
    it('should remove the price from the filters', () => {
      const priceId = testDataFactory.price.id();
      const otherPriceId = testDataFactory.price.id();
      setup({
        priceIdFilters: [
          priceId,
          otherPriceId,
        ],
      });

      dispatcher.dispatch(customerEvents.removePriceFilter({
        priceId,
      }));

      validateState({
        priceIdFilters: [otherPriceId],
      });
    });
  });

  describe('sortJobs', () => {
    it('should store the sorting', () => {
      dispatcher.dispatch(customerEvents.sortJobs({
        sortBy: 'duration',
        sortOrder: 'desc',
      }));

      validateState({
        jobListSortBy: 'duration',
        jobListSortOrder: 'desc',
      });
    });

    it('should replace the previous sorting', () => {
      setup({
        jobListSortBy: 'total',
        jobListSortOrder: 'asc',
      });

      dispatcher.dispatch(customerEvents.sortJobs({
        sortBy: 'hourlyRate',
        sortOrder: 'desc',
      }));

      validateState({
        jobListSortBy: 'hourlyRate',
        jobListSortOrder: 'desc',
      });
    });
  });
});
