import { TestBed } from '@angular/core/testing';
import { CustomerService } from '@hairdressing/services/customer-service';
import { CustomerState, CustomerStore, provideCustomerStoreInitialState } from '@hairdressing/state/customer/customer-store';
import { BottomSheetService, createDispatcherSpy, DialogService, MockSignalStore, notificationEvents, provideMockSignalStore, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { CustomerDialog } from '@hairdressing/app/customer/customer-dialog/customer-dialog';
import { Customer } from '@household/shared/types/types';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { CustomerJobReport } from '@hairdressing/types';
import { CustomerJobDialog } from '@hairdressing/app/customer/customer-job-dialog/customer-job-dialog';
import { CustomerAddToBlacklistDialog } from '@hairdressing/app/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog';

describe('Customer store', () => {
  let initialState: CustomerState; 
  let store: InstanceType<typeof CustomerStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCustomerService: MockService<CustomerService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;

  const validateState = (currentValue?: Partial<CustomerState & {jobList: CustomerJobReport[]}>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(currentValue?.isInProgress ?? initialState.isInProgress);
    expect(store.customerList(), 'customerList').toEqual(currentValue?.customerList ?? initialState.customerList);
    expect(store.customerWorks(), 'customerWorks').toEqual(currentValue?.customerWorks ?? initialState.customerWorks);
    expect(store.jobListSortBy(), 'jobListSortBy').toEqual(currentValue?.jobListSortBy ?? initialState.jobListSortBy);
    expect(store.jobListSortOrder(), 'jobListSortOrder').toEqual(currentValue?.jobListSortOrder ?? initialState.jobListSortOrder);
    expect(store.priceIdFilters(), 'priceIdFilters').toEqual(currentValue?.priceIdFilters ?? initialState.priceIdFilters);
    expect(store.jobList(), 'jobList').toEqual(currentValue?.jobList ?? []);
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
    dispatchSpy = createDispatcherSpy(dispatcher);
    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
  };

  beforeEach(() => {
    mockCustomerService = createMockService('listCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer', 'listCustomerWorks', 'createCustomerJob', 'updateCustomerJob', 'deleteCustomerJob', 'updateCustomerBlacklist', 'deleteCustomerBlacklist');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');
  
    setup();
  });

  it('should initialize', () => {
    validateState();
  });

  describe('dispatching createCustomer', () => {
    it('should open dialog and dispatch if submitted', () => {
      const customerRequest = testDataFactory.customer.request();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(customerRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.createCustomer()); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.createCustomerInitiated(customerRequest));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.createCustomer()); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching updateCustomer', () => {
    const originalCustomer = testDataFactory.customer.response();

    it('should open dialog and dispatch if submitted', () => {
      const customerRequest = testDataFactory.customer.request();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(customerRequest),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.updateCustomer(originalCustomer)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerDialog, {
        disableClose: true,
        data: originalCustomer,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerInitiated({
        customerId: originalCustomer.customerId,
        ...customerRequest,
      }));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.updateCustomer(originalCustomer)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerDialog, {
        disableClose: true,
        data: originalCustomer,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching deleteCustomer', () => {
    const originalCustomer = testDataFactory.customer.response();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(customerEvents.deleteCustomer(originalCustomer)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a vendéget?',
        content: originalCustomer.name,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerInitiated({
        customerId: originalCustomer.customerId,
      }));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(customerEvents.deleteCustomer(originalCustomer)); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a vendéget?',
        content: originalCustomer.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching createCustomerJob', () => {
    const originalCustomer = testDataFactory.customer.response();

    it('should open dialog and dispatch if submitted', () => {
      const jobRequest = testDataFactory.customer.job.request();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          ...jobRequest,
          customerId: originalCustomer.customerId,
        }),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.createCustomerJob(originalCustomer)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerJobDialog, {
        data: {
          customerId: originalCustomer.customerId,
        },
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.createCustomerJobInitiated({
        customerId: originalCustomer.customerId,
        ...jobRequest,
      }));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.createCustomerJob(originalCustomer)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerJobDialog, {
        data: {
          customerId: originalCustomer.customerId,
        },
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching updateCustomerJob', () => {    
    const originalCustomerId = testDataFactory.customer.id();
    const originalJob = testDataFactory.customer.job.response();

    it('should open dialog and dispatch if submitted', () => {
      const jobRequest = testDataFactory.customer.job.request();
          
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          ...jobRequest,
          customerId: originalCustomerId,
          jobName: originalJob.name,
        }),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.updateCustomerJob({
        customerId: originalCustomerId,
        ...originalJob,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerJobDialog, {
        data: {
          customerId: originalCustomerId,
          job: originalJob,
        },
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerJobInitiated({
        customerId: originalCustomerId,
        jobName: originalJob.name,
        ...jobRequest,
      }));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.updateCustomerJob({
        customerId: originalCustomerId,
        ...originalJob,
      })); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerJobDialog, {
        data: {
          customerId: originalCustomerId,
          job: originalJob,
        },
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching deleteCustomerJob', () => {
    const originalCustomerId = testDataFactory.customer.id();
    const originalJob = testDataFactory.customer.job.response();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(customerEvents.deleteCustomerJob({
        customerId: originalCustomerId,
        ...originalJob,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a munkát?',
        content: originalJob.name,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerJobInitiated({
        customerId: originalCustomerId,
        jobName: originalJob.name,
      }));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(customerEvents.deleteCustomerJob({
        customerId: originalCustomerId,
        ...originalJob,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a munkát?',
        content: originalJob.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching addCustomerToBlacklist', () => {
    const originalCustomerA = testDataFactory.customer.response();
    const originalCustomerB = testDataFactory.customer.response();

    it('should open dialog and dispatch if submitted', () => {         
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of([
          originalCustomerA,
          originalCustomerB,
        ]),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.addCustomerToBlacklist(originalCustomerA)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerAddToBlacklistDialog, {
        data: originalCustomerA,
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.addCustomerToBlacklistInitiated([
        originalCustomerA,
        originalCustomerB,
      ]));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);
    
      dispatcher.dispatch(customerEvents.addCustomerToBlacklist(originalCustomerA)); 
    
      validateFunctionCall(mockMatDialog.functions.open, CustomerAddToBlacklistDialog, {
        data: originalCustomerA,
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching deleteCustomerFromBlacklist', () => {
    const customerA = testDataFactory.customer.response();
    const customerB = testDataFactory.customer.response();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));
    
      dispatcher.dispatch(customerEvents.deleteCustomerFromBlacklist({
        currentCustomer: customerA,
        selectedCustomer: customerB,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod a tiltást közöttük?',
        content: `${customerA.name} és ${customerB.name}`,
      });
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerFromBlacklistInitiated([
        customerA.customerId,
        customerB.customerId,
      ]));
      validateState();
    });
    
    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));
    
      dispatcher.dispatch(customerEvents.deleteCustomerFromBlacklist({
        currentCustomer: customerA,
        selectedCustomer: customerB,
      })); 
    
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod a tiltást közöttük?',
        content: `${customerA.name} és ${customerB.name}`,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching addPriceFilter', () => {
    it('should update store', () => {
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(customerEvents.addPriceFilter({
        priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        priceIdFilters: [priceId],
      });
    });    

    it('should update computed properties', () => {
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
      const priceId = price.priceId;
      const customer = testDataFactory.customer.response({
        jobs: [
          job,
          testDataFactory.customer.job.response(),
        ],
      });
      const total = job.additionalPrice + (price.amount * quantity);

      const expectedJob: CustomerJobReport = {
        customerId: customer.customerId,
        customerName: customer.name,
        jobName: job.name,
        duration: job.duration,
        prices: job.prices,
        total,
        hourlyRate: total / (job.duration / 4),
      };

      setup({
        customerList: [customer],
      });

      dispatcher.dispatch(customerEvents.addPriceFilter({
        priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        priceIdFilters: [priceId],
        jobList: [expectedJob],
      });
    });
  });

  describe('dispatching removePriceFilter', () => {
    it('should update store', () => {
      const priceId = testDataFactory.price.id();

      setup({
        priceIdFilters: [priceId],
      });

      dispatcher.dispatch(customerEvents.removePriceFilter({
        priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        priceIdFilters: [],
      });
    });

    it('should update computed properties', () => {
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
        jobs: [job],
      });
      const total = job.additionalPrice + (price.amount * quantity);

      const expectedJob: CustomerJobReport = {
        customerId: customer.customerId,
        customerName: customer.name,
        jobName: job.name,
        duration: job.duration,
        prices: job.prices,
        total,
        hourlyRate: total / (job.duration / 4),
      };

      const priceId = testDataFactory.price.id();

      setup({
        priceIdFilters: [priceId],
        customerList: [customer],
      });

      dispatcher.dispatch(customerEvents.removePriceFilter({
        priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        priceIdFilters: [],
        jobList: [expectedJob],
      });
    });    
  });

  describe('dispatching sortJobs', () => {
    it('should update store', () => {
      dispatcher.dispatch(customerEvents.sortJobs({
        sortBy: 'duration',
        sortOrder: 'desc',
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        jobListSortBy: 'duration',
        jobListSortOrder: 'desc',
      });
    });
    
    describe('should update computed properties', () => {
      let jobA: Customer.Job.Response;
      let jobB: Customer.Job.Response;
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
          customerList: [customer],
        });
      });

      it('sorting duration-desc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'duration',
          sortOrder: 'desc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'duration',
          jobListSortOrder: 'desc',
          jobList: [
            expect.objectContaining({
              jobName: jobB.name,
            }),
            expect.objectContaining({
              jobName: jobA.name,
            }),
          ],
        });
      });

      it('sorting duration-asc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'duration',
          sortOrder: 'asc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'duration',
          jobListSortOrder: 'asc',
          jobList: [
            expect.objectContaining({
              jobName: jobA.name,
            }),
            expect.objectContaining({
              jobName: jobB.name,
            }),
          ],
        });
      });

      it('sorting total-desc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'total',
          sortOrder: 'desc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'total',
          jobListSortOrder: 'desc',
          jobList: [
            expect.objectContaining({
              jobName: jobB.name,
            }),
            expect.objectContaining({
              jobName: jobA.name,
            }),
          ],
        });
      });

      it('sorting total-asc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'total',
          sortOrder: 'asc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'total',
          jobListSortOrder: 'asc',
          jobList: [
            expect.objectContaining({
              jobName: jobA.name,
            }),
            expect.objectContaining({
              jobName: jobB.name,
            }),
          ],
        });
      });

      it('sorting hourlyRate-desc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'hourlyRate',
          sortOrder: 'desc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'hourlyRate',
          jobListSortOrder: 'desc',
          jobList: [
            expect.objectContaining({
              jobName: jobB.name,
            }),
            expect.objectContaining({
              jobName: jobA.name,
            }),
          ],
        });
      });

      it('sorting hourlyRate-asc', () => {  
        dispatcher.dispatch(customerEvents.sortJobs({
          sortBy: 'hourlyRate',
          sortOrder: 'asc',
        }));

        validateDispatcher(dispatchSpy);
        validateState({
          jobListSortBy: 'hourlyRate',
          jobListSortOrder: 'asc',
          jobList: [
            expect.objectContaining({
              jobName: jobA.name,
            }),
            expect.objectContaining({
              jobName: jobB.name,
            }),
          ],
        });
      });
    });

  });

  describe('dispatching listCustomersInitiated', () => {
    it('should call API and dispatch response', () => {
      const customerList = [testDataFactory.customer.response()];
      mockCustomerService.functions.listCustomers.mockReturnValue(of(customerList));
    
      dispatcher.dispatch(customerApiEvents.listCustomersInitiated());
    
      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, customerApiEvents.listCustomersCompleted(customerList));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.listCustomers.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.listCustomersInitiated());
    
      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching listCustomersCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const customer = testDataFactory.customer.response({
        name,
        jobs: [],
      });
      
      dispatcher.dispatch(customerApiEvents.listCustomersCompleted([customer]));

      validateDispatcher(dispatchSpy);
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
  });

  describe('dispatching createCustomerInitiated', () => {
    const customerRequest = testDataFactory.customer.request();
    const customerId = testDataFactory.customer.id();
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.createCustomer.mockReturnValue(of({
        customerId,
      }));
    
      dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));
    
      validateFunctionCall(mockCustomerService.functions.createCustomer, customerRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.createCustomerCompleted({
        customerId,
        ...customerRequest, 
      }));
      validateState();
    });
    
    it('should call API and show notification if price name is already taken', () => {
      mockCustomerService.functions.createCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate customer name',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));
    
      validateFunctionCall(mockCustomerService.functions.createCustomer, customerRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Vendég (${customerRequest.name}) már létezik!`));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.createCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));
    
      validateFunctionCall(mockCustomerService.functions.createCustomer, customerRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createCustomerCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const customerId = testDataFactory.customer.id();
      const customerRequest = testDataFactory.customer.request({
        name,
      });

      dispatcher.dispatch(customerApiEvents.createCustomerCompleted({
        customerId,
        ...customerRequest,
      }));

      validateDispatcher(dispatchSpy);
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
  });

  describe('dispatching updateCustomerInitiated', () => {
    let customerRequest: Customer.Request;
    let customerId: Customer.Id;
    let originalCustomer: Customer.Response;

    beforeEach(() => {
      originalCustomer = testDataFactory.customer.response({
        jobs: [],
      }); 
      customerId = originalCustomer.customerId;
      customerRequest = testDataFactory.customer.request();

      setup({
        customerList: [originalCustomer],
      });
    });
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.updateCustomer.mockReturnValue(of({
        customerId,
      }));
    
      dispatcher.dispatch(customerApiEvents.updateCustomerInitiated({
        customerId,
        ...customerRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, customerRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerCompleted({
        customerId,
        ...customerRequest, 
      }));
      validateState({
        isInProgress: [customerId],
      });
    });
    
    it('should call API and show notification if price name is already taken', () => {
      mockCustomerService.functions.updateCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate customer name',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.updateCustomerInitiated({
        customerId,
        ...customerRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, customerRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerFailed({
        customerId,
      }), notificationEvents.showMessage(`Vendég (${customerRequest.name}) már létezik!`));
      validateState({
        isInProgress: [customerId],
      });
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.updateCustomerInitiated({
        customerId,
        ...customerRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, customerRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerFailed({
        customerId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [customerId],
      });
    });
  });

  describe('dispatching updateCustomerCompleted', () => {
    it('should update store', () => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      });
      const name = 'ékezetes név';
      const customerRequest = testDataFactory.customer.request({
        name,
      });

      setup({
        customerList: [originalCustomer],
        isInProgress: [originalCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerCompleted({
        customerId: originalCustomer.customerId,
        ...customerRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        customerList: [
          {
            ...originalCustomer,
            customerId: originalCustomer.customerId,
            ...customerRequest,
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
  });

  describe('dispatching updateCustomerFailed', () => {
    it('should update store', () => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      });

      setup({
        customerList: [originalCustomer],
        isInProgress: [originalCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerFailed({
        customerId: originalCustomer.customerId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });    
  });

  describe('dispatching deleteCustomerInitiated', () => {
    let customerId: Customer.Id;

    beforeEach(() => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      }); 
      customerId = originalCustomer.customerId;

      setup({
        customerList: [originalCustomer],
      });
    });
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.deleteCustomer.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerInitiated({
        customerId,
      }));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerCompleted({
        customerId,
      }));
      validateState({
        isInProgress: [customerId],
      });
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerInitiated({
        customerId,
      }));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerFailed({
        customerId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [customerId],
      });
    });
  });

  describe('dispatching deleteCustomerCompleted', () => {
    it('should update store', () => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      }); 

      setup({
        customerList: [originalCustomer],
        isInProgress: [originalCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerCompleted({
        customerId: originalCustomer.customerId,
      }));

      validateDispatcher(dispatchSpy);
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
    
  });

  describe('dispatching deleteCustomerFailed', () => {
    it('should update store', () => {
      const originalCustomer = testDataFactory.customer.response({
        jobs: [],
      }); 

      setup({
        customerList: [originalCustomer],
        isInProgress: [originalCustomer.customerId],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerFailed({
        customerId: originalCustomer.customerId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
    
  });

  describe('dispatching createCustomerJobInitiated', () => {
    const jobRequest = testDataFactory.customer.job.request();
    const customerId = testDataFactory.customer.id();
    
    it('should call API and dispatch response', () => {
      const priceResponse = testDataFactory.price.response();

      mockCustomerService.functions.createCustomerJob.mockReturnValue(of({
        customerId,
      }));
      mockPriceStore.priceList.set([priceResponse]);
    
      dispatcher.dispatch(customerApiEvents.createCustomerJobInitiated({
        customerId,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.createCustomerJob, customerId, jobRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.createCustomerJobCompleted({
        customerId,
        ...jobRequest, 
        priceList: [priceResponse],
      }));
      validateState();
    });
    
    it('should call API and show notification if price name is already taken', () => {
      mockCustomerService.functions.createCustomerJob.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate customer job name',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.createCustomerJobInitiated({
        customerId,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.createCustomerJob, customerId, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Munka (${jobRequest.name}) már létezik!`));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.createCustomerJob.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.createCustomerJobInitiated({
        customerId,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.createCustomerJob, customerId, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createCustomerJobCompleted', () => {
    it('should update store', () => {
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
    
      const expectedJob: CustomerJobReport = {
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
      };

      setup({
        customerList: [originalCustomer],
      });

      dispatcher.dispatch(customerApiEvents.createCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        priceList: [priceResponse],
      }));

      validateDispatcher(dispatchSpy);
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
                title: originalCustomer.isGroup ? jobRequest.name : `${originalCustomer.name}: ${jobRequest.name}`,
              },
            ],
          },
        ],
        jobList: [expectedJob],
      });
    });
    
  });

  describe('dispatching updateCustomerJobInitiated', () => {
    const jobRequest = testDataFactory.customer.job.request();
    const customerId = testDataFactory.customer.id();
    const jobName = 'jobName';
    
    it('should call API and dispatch response', () => {
      const priceResponse = testDataFactory.price.response();

      mockCustomerService.functions.updateCustomerJob.mockReturnValue(of({
        customerId,
      }));
      mockPriceStore.priceList.set([priceResponse]);
    
      dispatcher.dispatch(customerApiEvents.updateCustomerJobInitiated({
        customerId,
        jobName,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomerJob, customerId, jobName, jobRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerJobCompleted({
        customerId,
        jobName,
        ...jobRequest, 
        priceList: [priceResponse],
      }));
      validateState();
    });
    
    it('should call API and show notification if price name is already taken', () => {
      mockCustomerService.functions.updateCustomerJob.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate customer job name',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.updateCustomerJobInitiated({
        customerId,
        jobName,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomerJob, customerId, jobName, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Munka (${jobRequest.name}) már létezik!`));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomerJob.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.updateCustomerJobInitiated({
        customerId,
        jobName,
        ...jobRequest,
      }));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomerJob, customerId, jobName, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching updateCustomerJobCompleted', () => {
    it('should update store', () => {      
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
    
      const expectedJob: CustomerJobReport = {
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
      };

      setup({
        customerList: [originalCustomer],
      });

      dispatcher.dispatch(customerApiEvents.updateCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        ...jobRequest,
        jobName: originalJob.name,
        priceList: [priceResponse],
      }));

      validateDispatcher(dispatchSpy);
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
                title: originalCustomer.isGroup ? jobRequest.name : `${originalCustomer.name}: ${jobRequest.name}`,
              },
            ],
          },
        ],
        jobList: [expectedJob],
      });
    });
    
  });

  describe('dispatching deleteCustomerJobInitiated', () => {
    const customerId = testDataFactory.customer.id();
    const jobName = 'jobName';
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.deleteCustomerJob.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerJobInitiated({
        customerId,
        jobName,
      }));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomerJob, customerId, jobName);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerJobCompleted({
        customerId,
        jobName,
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomerJob.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerJobInitiated({
        customerId,
        jobName,
      }));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomerJob, customerId, jobName);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });    
  });

  describe('dispatching deleteCustomerJobCompleted', () => {
    it('should update store', () => {            
      const originalJob = testDataFactory.customer.job.response();
      const originalCustomer = testDataFactory.customer.response({
        jobs: [originalJob],
      });

      setup({
        customerList: [originalCustomer],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerJobCompleted({
        customerId: originalCustomer.customerId,
        jobName: originalJob.name,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        customerList: [
          {
            ...originalCustomer,
            jobs: [],
          },
        ],
      });
    });
    
  });

  describe('dispatching listCustomerWorksInitiated', () => {
    const customerId = testDataFactory.customer.id();

    it('should call API and dispatch response', () => {
      const work = testDataFactory.calendar.entry.response.workBase();
      mockCustomerService.functions.listCustomerWorks.mockReturnValue(of([work]));
    
      dispatcher.dispatch(customerApiEvents.listCustomerWorksInitiated({
        customerId,
      }));
    
      expect(mockCustomerService.functions.listCustomerWorks).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, customerApiEvents.listCustomerWorksCompleted({
        customerId,
        works: [work],
      }));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.listCustomerWorks.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.listCustomerWorksInitiated({
        customerId,
      }));
    
      expect(mockCustomerService.functions.listCustomerWorks).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });    
  });

  describe('dispatching listCustomerWorksCompleted', () => {
    it('should update store', () => {
      const customerId = testDataFactory.customer.id();
      const workEntry = testDataFactory.calendar.entry.response.workBase();

      dispatcher.dispatch(customerApiEvents.listCustomerWorksCompleted({
        customerId,
        works: [workEntry],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        customerWorks: {
          [customerId]: [workEntry],
        },
      });
    });
    
  });

  describe('dispatching addCustomerToBlacklistInitiated', () => {
    const customerA = testDataFactory.customer.response();
    const customerB = testDataFactory.customer.response();
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.updateCustomerBlacklist.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(customerApiEvents.addCustomerToBlacklistInitiated([
        customerA,
        customerB,
      ]));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomerBlacklist, [
        customerA.customerId,
        customerB.customerId,
      ]);
      validateDispatcher(dispatchSpy, customerApiEvents.addCustomerToBlacklistCompleted([
        customerA,
        customerB,
      ]));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomerBlacklist.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.addCustomerToBlacklistInitiated([
        customerA,
        customerB,
      ]));
    
      validateFunctionCall(mockCustomerService.functions.updateCustomerBlacklist, [
        customerA.customerId,
        customerB.customerId,
      ]);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });    
  });

  describe('dispatching addCustomerToBlacklistCompleted', () => {
    it('should update store', () => {
      const customerA = testDataFactory.customer.response({
        jobs: [],
      });
      const customerB = testDataFactory.customer.response({
        jobs: [],
      });

      setup({
        customerList: [
          customerA,
          customerB,
        ],
      });

      dispatcher.dispatch(customerApiEvents.addCustomerToBlacklistCompleted([
        customerA,
        customerB,
      ]));

      validateDispatcher(dispatchSpy);
      validateState({
        customerList: [
          {
            ...customerA,
            blacklistedCustomers: [customerB],
          },
          {
            ...customerB,
            blacklistedCustomers: [customerA],
          },
        ],
      });
    });
    
  });

  describe('dispatching deleteCustomerFromBlacklistInitiated', () => {
    const customerIdA = testDataFactory.customer.id();
    const customerIdB = testDataFactory.customer.id();
    
    it('should call API and dispatch response', () => {
      mockCustomerService.functions.deleteCustomerBlacklist.mockReturnValue(of(undefined));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerFromBlacklistInitiated([
        customerIdA,
        customerIdB,
      ]));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomerBlacklist, [
        customerIdA,
        customerIdB,
      ]);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerFromBlacklistCompleted([
        customerIdA,
        customerIdB,
      ]));
      validateState();
    });
    
    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomerBlacklist.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));
    
      dispatcher.dispatch(customerApiEvents.deleteCustomerFromBlacklistInitiated([
        customerIdA,
        customerIdB,
      ]));
    
      validateFunctionCall(mockCustomerService.functions.deleteCustomerBlacklist, [
        customerIdA,
        customerIdB,
      ]);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });  
  });

  describe('dispatching deleteCustomerFromBlacklistCompleted', () => {
    it('should update store', () => {    
      const customerA = testDataFactory.customer.response({
        jobs: [],
      });
      const customerB = testDataFactory.customer.response({
        jobs: [],
        blacklistedCustomers: [customerA],
      });
      customerA.blacklistedCustomers = [customerB];

      setup({
        customerList: [
          customerA,
          customerB,
        ],
      });

      dispatcher.dispatch(customerApiEvents.deleteCustomerFromBlacklistCompleted([
        customerA.customerId,
        customerB.customerId,
      ]));

      validateDispatcher(dispatchSpy);
      validateState({
        customerList: [
          {
            ...customerA,
            blacklistedCustomers: [],
          },
          {
            ...customerB,
            blacklistedCustomers: [],
          },
        ],
      });
    });    
  });
});
  
