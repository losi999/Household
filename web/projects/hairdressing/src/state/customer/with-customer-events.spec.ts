// The dialog classes the event handlers reference import the store, which imports the event handlers back.
// Loading the store first resolves that cycle in the same order as the application does.
import '@hairdressing/state/customer/customer-store';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomerAddToBlacklistDialog } from '@hairdressing/app/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog';
import { CustomerDialog } from '@hairdressing/app/customer/customer-dialog/customer-dialog';
import { CustomerJobDialog } from '@hairdressing/app/customer/customer-job-dialog/customer-job-dialog';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { withCustomerEvents } from '@hairdressing/state/customer/with-customer-events';
import { createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';
import { Mock } from 'vitest';

describe('withCustomerEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withCustomerEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
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
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(customerEvents.deleteCustomer(originalCustomer));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a vendéget?',
        content: originalCustomer.name,
      });
      validateDispatcher(dispatchSpy);
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
    });
  });

  describe('dispatching events without a UI handler', () => {
    it('should not open anything or dispatch anything for price filters and sorting', () => {
      dispatcher.dispatch(customerEvents.addPriceFilter({
        priceId: testDataFactory.price.id(),
      }));
      dispatcher.dispatch(customerEvents.sortJobs({
        sortBy: 'duration',
        sortOrder: 'asc',
      }));

      validateFunctionCall(mockMatDialog.functions.open);
      validateFunctionCall(mockDialogService.functions.openConfirmationDialog);
    });
  });
});
