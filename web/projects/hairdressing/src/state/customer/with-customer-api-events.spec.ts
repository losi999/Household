import { TestBed } from '@angular/core/testing';
import { CustomerService } from '@hairdressing/services/customer-service';
import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { withCustomerApiEvents } from '@hairdressing/state/customer/with-customer-api-events';
import { createDispatcherSpy, MockSignalStore, notificationEvents, provideMockSignalStore, validateDispatcher } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';

describe('withCustomerApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockCustomerService: MockService<CustomerService>;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;

  const genericError = () => throwError(() => ({
    error: {
      message: 'There is an error',
    },
  }));

  const setup = () => {
    TestBed.resetTestingModule();

    mockCustomerService = createMockService('listCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer', 'listCustomerWorks', 'createCustomerJob', 'updateCustomerJob', 'deleteCustomerJob', 'updateCustomerBlacklist', 'deleteCustomerBlacklist');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService.service,
        },
        provideMockSignalStore(PriceStore, 'priceList'),
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCustomerApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listCustomersInitiated', () => {
    it('should call API and dispatch response', () => {
      const customerList = [testDataFactory.customer.response()];
      mockCustomerService.functions.listCustomers.mockReturnValue(of(customerList));

      dispatcher.dispatch(customerApiEvents.listCustomersInitiated());

      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, customerApiEvents.listCustomersCompleted(customerList));
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.listCustomers.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.listCustomersInitiated());

      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
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
    });

    it('should call API and show notification if customer name is already taken', () => {
      mockCustomerService.functions.createCustomer.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate customer name',
        },
      })));

      dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));

      validateFunctionCall(mockCustomerService.functions.createCustomer, customerRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Vendég (${customerRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.createCustomer.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.createCustomerInitiated(customerRequest));

      validateFunctionCall(mockCustomerService.functions.createCustomer, customerRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching updateCustomerInitiated', () => {
    const customerRequest = testDataFactory.customer.request();
    const customerId = testDataFactory.customer.id();

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
    });

    it('should call API and show notification if customer name is already taken', () => {
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomer.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.updateCustomerInitiated({
        customerId,
        ...customerRequest,
      }));

      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, customerRequest);
      validateDispatcher(dispatchSpy, customerApiEvents.updateCustomerFailed({
        customerId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching deleteCustomerInitiated', () => {
    const customerId = testDataFactory.customer.id();

    it('should call API and dispatch response', () => {
      mockCustomerService.functions.deleteCustomer.mockReturnValue(of(undefined));

      dispatcher.dispatch(customerApiEvents.deleteCustomerInitiated({
        customerId,
      }));

      validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerCompleted({
        customerId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomer.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.deleteCustomerInitiated({
        customerId,
      }));

      validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
      validateDispatcher(dispatchSpy, customerApiEvents.deleteCustomerFailed({
        customerId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching createCustomerJobInitiated', () => {
    const jobRequest = testDataFactory.customer.job.request();
    const customerId = testDataFactory.customer.id();

    it('should call API and dispatch response with the current price list', () => {
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
    });

    it('should call API and show notification if job name is already taken', () => {
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.createCustomerJob.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.createCustomerJobInitiated({
        customerId,
        ...jobRequest,
      }));

      validateFunctionCall(mockCustomerService.functions.createCustomerJob, customerId, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching updateCustomerJobInitiated', () => {
    const jobRequest = testDataFactory.customer.job.request();
    const customerId = testDataFactory.customer.id();
    const jobName = 'jobName';

    it('should call API and dispatch response with the current price list', () => {
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
    });

    it('should call API and show notification if job name is already taken', () => {
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomerJob.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.updateCustomerJobInitiated({
        customerId,
        jobName,
        ...jobRequest,
      }));

      validateFunctionCall(mockCustomerService.functions.updateCustomerJob, customerId, jobName, jobRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomerJob.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.deleteCustomerJobInitiated({
        customerId,
        jobName,
      }));

      validateFunctionCall(mockCustomerService.functions.deleteCustomerJob, customerId, jobName);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
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

      validateFunctionCall(mockCustomerService.functions.listCustomerWorks, customerId);
      validateDispatcher(dispatchSpy, customerApiEvents.listCustomerWorksCompleted({
        customerId,
        works: [work],
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.listCustomerWorks.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.listCustomerWorksInitiated({
        customerId,
      }));

      validateFunctionCall(mockCustomerService.functions.listCustomerWorks, customerId);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.updateCustomerBlacklist.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.addCustomerToBlacklistInitiated([
        customerA,
        customerB,
      ]));

      validateFunctionCall(mockCustomerService.functions.updateCustomerBlacklist, [
        customerA.customerId,
        customerB.customerId,
      ]);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
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
    });

    it('should call API and show notification if there is an error', () => {
      mockCustomerService.functions.deleteCustomerBlacklist.mockReturnValue(genericError());

      dispatcher.dispatch(customerApiEvents.deleteCustomerFromBlacklistInitiated([
        customerIdA,
        customerIdB,
      ]));

      validateFunctionCall(mockCustomerService.functions.deleteCustomerBlacklist, [
        customerIdA,
        customerIdB,
      ]);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });
});
