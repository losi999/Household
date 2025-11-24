import { TestBed } from '@angular/core/testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerApiEffects } from '@household/web/app/hairdressing/customer/state/customer-api.effects';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectPriceList } from '@household/web/app/hairdressing/price/state/price.selector';
import { CustomerService } from '@household/web/services/customer.service';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { expectEffectMultipleEmission } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';

describe('Customer API effects', () => {
  let actions$: Observable<any>;
  let effects: CustomerApiEffects;
  let store: MockStore;
  let mockCustomerService: jasmine.SpyObj<CustomerService>;

  beforeEach(() => {
    mockCustomerService = jasmine.createSpyObj<CustomerService>([
      'listCustomers',
      'listCustomerWorks',
      'createCustomer',
      'updateCustomer',
      'createCustomerJob',
      'updateCustomerJob',
      'deleteCustomerJob',
      'updateCustomerBlacklist',
      'deleteCustomerBlacklist',
    ]);

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
    it('should dispatch [Customer API] List customers completed', (done) => {
      const customerResponse = testDataFactory.customer.response();
      
      mockCustomerService.listCustomers.and.returnValue(of([customerResponse]));

      actions$ = of(customerApiActions.listCustomersInitiated());

      effects.listCustomers.subscribe((result) => {
        expect(result).toEqual(customerApiActions.listCustomersCompleted({
          customers: [customerResponse],
        }));
      });
      expect(mockCustomerService.listCustomers).toHaveBeenCalledTimes(1);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      mockCustomerService.listCustomers.and.returnValue(throwError(() => new Error('Customer API error')));
  
      actions$ = of(customerApiActions.listCustomersInitiated());
  
      expectEffectMultipleEmission(effects.listCustomers, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCustomerService.listCustomers).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('On List customer works initiated', () => {
    it('should dispatch [Customer API] List customer works completed', (done) => {
      const customerId = testDataFactory.customer.id();
      const workResponse = testDataFactory.calendar.entry.response.workBase();
      
      mockCustomerService.listCustomerWorks.and.returnValue(of([workResponse]));

      actions$ = of(customerApiActions.listCustomerWorksInitiated({
        customerId,
      }));

      effects.listCustomerWorks.subscribe((result) => {
        expect(result).toEqual(customerApiActions.listCustomerWorksCompleted({
          customerId,
          works: [workResponse],
        }));
      });
      expect(mockCustomerService.listCustomerWorks).toHaveBeenCalledWith(customerId);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const customerId = testDataFactory.customer.id();

      mockCustomerService.listCustomerWorks.and.returnValue(throwError(() => new Error('Customer API error')));
  
      actions$ = of(customerApiActions.listCustomerWorksInitiated({
        customerId,
      }));
  
      expectEffectMultipleEmission(effects.listCustomerWorks, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCustomerService.listCustomerWorks).toHaveBeenCalledWith(customerId);
        done();
      });
    });
  });

  describe('On Create customer initiated', () => {
    it('should dispatch [Customer API] Create customer completed', (done) => {
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.createCustomer.and.returnValue(of({
        customerId,
      }));

      actions$ = of(customerApiActions.createCustomerInitiated(request));

      effects.createCustomer.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerCompleted({
          customerId,
          ...request,
        }));
      });
      expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(request);
      done();      
    });
  
    it('should dispatch duplicate error if customer name is already in use', (done) => { 
      const request = testDataFactory.customer.request();
      
      mockCustomerService.createCustomer.and.returnValue(throwError(() => ({
        error: new Error('Duplicate customer name'),
      })));

      actions$ = of(customerApiActions.createCustomerInitiated(request));
  
      expectEffectMultipleEmission(effects.createCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Vendég (${request.name}) már létezik!`,
        }),
      ], () => {
        expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.customer.request();
      
      mockCustomerService.createCustomer.and.returnValue(throwError(() => new Error('Customer API error')));

      actions$ = of(customerApiActions.createCustomerInitiated(request));
  
      expectEffectMultipleEmission(effects.createCustomer, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(request);
        done();
      });
    });
  });

  describe('On Update customer initiated', () => {
    it('should dispatch [Customer API] Update customer completed', (done) => {
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.and.returnValue(of({
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
      expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(customerId, request);
      done();      
    });
  
    it('should dispatch duplicate error if customer name is already in use', (done) => { 
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.and.returnValue(throwError(() => ({
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
        expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(customerId, request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.customer.request();
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.updateCustomer.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(customerId, request);
        done();
      });
    });
  });

  describe('On Create customer job initiated', () => {
    it('should dispatch [Customer API] Create customer job completed', (done) => {
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);

      mockCustomerService.createCustomerJob.and.returnValue(of(undefined));

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
      expect(mockCustomerService.createCustomerJob).toHaveBeenCalledWith(customerId, request);
      done();      
    });
  
    it('should dispatch duplicate error if customer job name is already in use', (done) => { 
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.createCustomerJob.and.returnValue(throwError(() => ({
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
        expect(mockCustomerService.createCustomerJob).toHaveBeenCalledWith(customerId, request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.createCustomerJob.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.createCustomerJob).toHaveBeenCalledWith(customerId, request);
        done();
      });
    });
  });

  describe('On Update customer job initiated', () => {
    it('should dispatch [Customer API] Update customer job completed', (done) => {
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);

      mockCustomerService.updateCustomerJob.and.returnValue(of(undefined));

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
      expect(mockCustomerService.updateCustomerJob).toHaveBeenCalledWith(customerId, jobName, request);
      done();      
    });
  
    it('should dispatch duplicate error if customer job name is already in use', (done) => { 
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.updateCustomerJob.and.returnValue(throwError(() => ({
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
        expect(mockCustomerService.updateCustomerJob).toHaveBeenCalledWith(customerId, jobName, request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.customer.job.request();
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      const priceResponse = testDataFactory.price.response();
      
      store.overrideSelector(selectPriceList, [priceResponse]);
      
      mockCustomerService.updateCustomerJob.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.updateCustomerJob).toHaveBeenCalledWith(customerId, jobName, request);
        done();
      });
    });
  });

  describe('On Delete customer job initiated', () => {
    it('should dispatch [Customer API] Delete customer job completed', (done) => {
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();

      mockCustomerService.deleteCustomerJob.and.returnValue(of(undefined));

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
      expect(mockCustomerService.deleteCustomerJob).toHaveBeenCalledWith(customerId, jobName);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const jobName = 'job name';
      const customerId = testDataFactory.customer.id();
      
      mockCustomerService.deleteCustomerJob.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.deleteCustomerJob).toHaveBeenCalledWith(customerId, jobName);
        done();
      });
    });
  });

  describe('On Add customer to blacklist initiated', () => {
    it('should dispatch [Customer API] Add customer to blacklist completed', (done) => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      mockCustomerService.updateCustomerBlacklist.and.returnValue(of(undefined));

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
      expect(mockCustomerService.updateCustomerBlacklist).toHaveBeenCalledWith([
        customerA.customerId,
        customerB.customerId,
      ]);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();
      
      mockCustomerService.updateCustomerBlacklist.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.updateCustomerBlacklist).toHaveBeenCalledWith([
          customerA.customerId,
          customerB.customerId,
        ]);
        done();
      });
    });
  });

  describe('On Remove customer from blacklist initiated', () => {
    it('should dispatch [Customer API] Remove customer from blacklist completed', (done) => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      mockCustomerService.deleteCustomerBlacklist.and.returnValue(of(undefined));

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
      expect(mockCustomerService.deleteCustomerBlacklist).toHaveBeenCalledWith([
        customerA.customerId,
        customerB.customerId,
      ]);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();
      
      mockCustomerService.deleteCustomerBlacklist.and.returnValue(throwError(() => new Error('Customer API error')));

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
        expect(mockCustomerService.deleteCustomerBlacklist).toHaveBeenCalledWith([
          customerA.customerId,
          customerB.customerId,
        ]);
        done();
      });
    });
  });
});
