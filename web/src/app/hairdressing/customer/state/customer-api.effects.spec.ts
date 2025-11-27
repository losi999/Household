import { TestBed } from '@angular/core/testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectPriceList } from '@household/web/app/hairdressing/price/state/price.selector';
import { CustomerService } from '@household/web/services/customer.service';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { createMockService, expectEffectMultipleEmission, Mock, validateFunctionCall } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';

describe('Customer API effects', () => {
  let actions$: Observable<any>;
  let effects: CustomerApiEffects;
  let store: MockStore;
  let mockCustomerService: Mock<CustomerService>;

  beforeEach(() => {
    mockCustomerService = createMockService(
      'listCustomers',
      'listCustomerWorks',
      'createCustomer',
      'updateCustomer',
      'createCustomerJob',
      'updateCustomerJob',
      'deleteCustomerJob',
      'updateCustomerBlacklist',
      'deleteCustomerBlacklist',
    );

    TestBed.configureTestingModule({
      providers: [
        CustomerApiEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: CustomerService,
          useValue: mockCustomerService, 
        },
      ],
    });

    effects = TestBed.inject(CustomerApiEffects);
    store = TestBed.inject(MockStore);
  });

  describe('On List customers initiated', () => {
    it('should dispatch [Customer API] List customers completed', () => {
      const customerResponse = testDataFactory.customer.response();
      
      mockCustomerService.listCustomers.mockReturnValue(of([customerResponse]));

      actions$ = of(customerApiActions.listCustomersInitiated());

      effects.listCustomers.subscribe((result) => {
        expect(result).toEqual(customerApiActions.listCustomersCompleted({
          customers: [customerResponse],
        }));
      });
      expect(mockCustomerService.listCustomers).toHaveBeenCalledTimes(1);
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      mockCustomerService.listCustomers.mockReturnValue(throwError(() => new Error('Customer API error')));
  
      actions$ = of(customerApiActions.listCustomersInitiated());
  
      expectEffectMultipleEmission(effects.listCustomers, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCustomerService.listCustomers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('On List customer works initiated', () => {
    it('should dispatch [Customer API] List customer works completed', () => {
      const customerId = testDataFactory.customer.id();
      const workResponse = testDataFactory.calendar.entry.response.workBase();
      
      mockCustomerService.listCustomerWorks.mockReturnValue(of([workResponse]));

      actions$ = of(customerApiActions.listCustomerWorksInitiated({
        customerId,
      }));

      effects.listCustomerWorks.subscribe((result) => {
        expect(result).toEqual(customerApiActions.listCustomerWorksCompleted({
          customerId,
          works: [workResponse],
        }));
      });
      validateFunctionCall(mockCustomerService.listCustomerWorks, customerId);
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const customerId = testDataFactory.customer.id();

      mockCustomerService.listCustomerWorks.mockReturnValue(throwError(() => new Error('Customer API error')));
  
      actions$ = of(customerApiActions.listCustomerWorksInitiated({
        customerId,
      }));
  
      expectEffectMultipleEmission(effects.listCustomerWorks, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.listCustomerWorks, customerId);
      });
    });
  });

  describe('On Create customer initiated', () => {
    it('should dispatch [Customer API] Create customer completed', () => {
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.createCustomer.mockReturnValue(of({
        customerId,
      }));

      actions$ = of(customerApiActions.createCustomerInitiated(request));

      effects.createCustomer.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerCompleted({
          customerId,
          ...request,
        }));
      });
      validateFunctionCall(mockCustomerService.createCustomer, request);
    });
  
    it('should dispatch duplicate error if customer name is already in use', () => { 
      const request = testDataFactory.customer.request();
      
      mockCustomerService.createCustomer.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate customer name'),
      })));

      actions$ = of(customerApiActions.createCustomerInitiated(request));
  
      expectEffectMultipleEmission(effects.createCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Vendég (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.createCustomer, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.customer.request();
      
      mockCustomerService.createCustomer.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.createCustomerInitiated(request));
  
      expectEffectMultipleEmission(effects.createCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.createCustomer, request);
      });
    });
  });

  describe('On Update customer initiated', () => {
    it('should dispatch [Customer API] Update customer completed', () => {
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.mockReturnValue(of({
        customerId,
      }));

      actions$ = of(customerApiActions.updateCustomerInitiated({
        customerId,
        ...request,
      }));

      effects.updateCustomer.subscribe((result) => {
        expect(result).toEqual(customerApiActions.updateCustomerCompleted({
          customerId,
          ...request,
        }));
      });
      validateFunctionCall(mockCustomerService.updateCustomer, customerId, request);
    });
  
    it('should dispatch duplicate error if customer name is already in use', () => { 
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate customer name'),
      })));

      actions$ = of(customerApiActions.updateCustomerInitiated({
        customerId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.updateCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Vendég (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.updateCustomer, customerId, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.updateCustomerInitiated({
        customerId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.updateCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.updateCustomer, customerId, request);
      });
    });
  });

  describe('On Create customer job initiated', () => {
    it('should dispatch [Customer API] Create customer job completed', () => {
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);

      mockCustomerService.createCustomerJob.mockReturnValue(of(undefined));

      actions$ = of(customerApiActions.createCustomerJobInitiated({
        customerId,
        ...request,
      }));

      effects.createCustomerJob.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerJobCompleted({
          customerId,
          priceList: [priceResponse],
          ...request,
        }));
      });
      validateFunctionCall(mockCustomerService.createCustomerJob, customerId, request);
    });
  
    it('should dispatch duplicate error if customer job name is already in use', () => { 
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.createCustomerJob.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate customer job name'),
      })));

      actions$ = of(customerApiActions.createCustomerJobInitiated({
        customerId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.createCustomerJob, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Munka (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.createCustomerJob, customerId, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.createCustomerJob.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.createCustomerJobInitiated({
        customerId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.createCustomerJob, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.createCustomerJob, customerId, request);
      });
    });
  });

  describe('On Update customer job initiated', () => {
    it('should dispatch [Customer API] Update customer job completed', () => {
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);

      mockCustomerService.updateCustomerJob.mockReturnValue(of(undefined));

      actions$ = of(customerApiActions.updateCustomerJobInitiated({
        customerId,
        ...request,
        jobName,
      }));

      effects.updateCustomerJob.subscribe((result) => {
        expect(result).toEqual(customerApiActions.updateCustomerJobCompleted({
          customerId,
          priceList: [priceResponse],
          ...request,
          jobName,
        }));
      });
      validateFunctionCall(mockCustomerService.updateCustomerJob, customerId, jobName, request);
    });
  
    it('should dispatch duplicate error if customer job name is already in use', () => { 
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.updateCustomerJob.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate customer job name'),
      })));

      actions$ = of(customerApiActions.updateCustomerJobInitiated({
        customerId,
        ...request,
        jobName,
      }));
  
      expectEffectMultipleEmission(effects.updateCustomerJob, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Munka (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.updateCustomerJob, customerId, jobName, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.updateCustomerJob.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.updateCustomerJobInitiated({
        customerId,
        ...request,
        jobName,
      }));
  
      expectEffectMultipleEmission(effects.updateCustomerJob, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.updateCustomerJob, customerId, jobName, request);
      });
    });
  });

  describe('On Delete customer job initiated', () => {
    it('should dispatch [Customer API] Delete customer job completed', () => {
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();

      mockCustomerService.deleteCustomerJob.mockReturnValue(of(undefined));

      actions$ = of(customerApiActions.deleteCustomerJobInitiated({
        customerId,
        jobName,
      }));

      effects.deleteCustomerJob.subscribe((result) => {
        expect(result).toEqual(customerApiActions.deleteCustomerJobCompleted({
          customerId,
          jobName,
        }));
      });
      validateFunctionCall(mockCustomerService.deleteCustomerJob, customerId, jobName);
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.deleteCustomerJob.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.deleteCustomerJobInitiated({
        customerId,
        jobName,
      }));
  
      expectEffectMultipleEmission(effects.deleteCustomerJob, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.deleteCustomerJob, customerId, jobName);
      });
    });
  });

  describe('On Add customer to blacklist initiated', () => {
    it('should dispatch [Customer API] Add customer to blacklist completed', () => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      mockCustomerService.updateCustomerBlacklist.mockReturnValue(of(undefined));

      actions$ = of(customerApiActions.addCustomerToBlacklistInitiated({
        customers: [
          customerA,
          customerB,
        ],
      }));

      effects.addCustomerToBlacklist.subscribe((result) => {
        expect(result).toEqual(customerApiActions.addCustomerToBlacklistCompleted({
          customers: [
            customerA,
            customerB,
          ],
        }));
      });
      validateFunctionCall(mockCustomerService.updateCustomerBlacklist, [
        customerA.customerId,
        customerB.customerId,
      ]);
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();
      
      mockCustomerService.updateCustomerBlacklist.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.addCustomerToBlacklistInitiated({
        customers: [
          customerA,
          customerB,
        ],
      }));
  
      expectEffectMultipleEmission(effects.addCustomerToBlacklist, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.updateCustomerBlacklist, [
          customerA.customerId,
          customerB.customerId,
        ]);
      });
    });
  });

  describe('On Remove customer from blacklist initiated', () => {
    it('should dispatch [Customer API] Remove customer from blacklist completed', () => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      mockCustomerService.deleteCustomerBlacklist.mockReturnValue(of(undefined));

      actions$ = of(customerApiActions.deleteCustomerFromBlacklistInitiated({
        customerIds: [
          customerA.customerId,
          customerB.customerId,
        ],
      }));

      effects.deleteCustomerFromBlacklist.subscribe((result) => {
        expect(result).toEqual(customerApiActions.deleteCustomerFromBlacklistCompleted({
          customerIds: [
            customerA.customerId,
            customerB.customerId,
          ],
        }));
      });
      validateFunctionCall(mockCustomerService.deleteCustomerBlacklist, [
        customerA.customerId,
        customerB.customerId,
      ]);
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();
      
      mockCustomerService.deleteCustomerBlacklist.mockReturnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.deleteCustomerFromBlacklistInitiated({
        customerIds: [
          customerA.customerId,
          customerB.customerId,
        ],
      }));
  
      expectEffectMultipleEmission(effects.deleteCustomerFromBlacklist, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockCustomerService.deleteCustomerBlacklist, [
          customerA.customerId,
          customerB.customerId,
        ]);
      });
    });
  });
});
