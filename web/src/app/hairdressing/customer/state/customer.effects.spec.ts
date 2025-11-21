import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerAddToBlacklistDialogResult } from '@household/web/app/hairdressing/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { CustomerDialogResult } from '@household/web/app/hairdressing/customer/customer-dialog/customer-dialog.component';
import { CustomerJobDialogResult } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { CustomerEffects } from '@household/web/app/hairdressing/customer/state/customer.effects';
import { DialogService } from '@household/web/services/dialog.service';
import { createMockService, expectEffectNotEmitted, Mock, returnDialogAfterClosed, validateFunctionCall } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';

describe('Customer effects', () => {
  let actions$: Observable<any>;
  let effects: CustomerEffects;
  let mockDialogService: Mock<DialogService>;
  let mockMatDialog: Mock<MatDialog>;
  let store: MockStore;

  beforeEach(() => {
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');
    TestBed.configureTestingModule({
      providers: [
        CustomerEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            customers: {},
          },
        }),
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog,
        },
      ],
    });

    effects = TestBed.inject(CustomerEffects);
    store = TestBed.inject(MockStore);
  });

  describe('On Create customer', () => {
    it('should dispatch [Customer API] Create customer initiated', () => {
      const request = testDataFactory.customer.request();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>(request));

      actions$ = of(customerActions.createCustomer());

      effects.openCreateCustomerDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerInitiated(request));
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({ }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>());
    
      actions$ = of(customerActions.createCustomer());
    
      expectEffectNotEmitted(effects.openCreateCustomerDialog, () => {
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({ }));
      });
    });
  });

  describe('On Update customer', () => {
    it('should dispatch [Customer API] Update customer initiated', () => {
      const customerResponse = testDataFactory.customer.response();
      const request = testDataFactory.customer.request();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>(request));

      store.setState({
        customers: {
          customerList: [customerResponse],
        },
      });

      actions$ = of(customerActions.updateCustomer({
        customerId: customerResponse.customerId,
      }));

      effects.openUpdateCustomerDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.updateCustomerInitiated({
          customerId: customerResponse.customerId,
          ...request,
        }));
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: customerResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customerResponse = testDataFactory.customer.response();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>());
    
      store.setState({
        customers: {
          customerList: [customerResponse],
        },
      });

      actions$ = of(customerActions.updateCustomer({
        customerId: customerResponse.customerId,
      }));
    
      expectEffectNotEmitted(effects.openUpdateCustomerDialog, () => {
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: customerResponse,
        }));
      });
    });
  });

  describe('On Create customer job', () => {
    it('should dispatch [Customer API] Create customer job initiated', () => {
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerJobDialogResult>({
        jobName: undefined,
        ...request,
        customerId,
      }));

      actions$ = of(customerActions.createCustomerJob({
        customerId,
      }));

      effects.openCreateCustomerJobDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerJobInitiated({
          customerId,
          ...request,
        }));
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customerId,
          },
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>());    

      actions$ = of(customerActions.createCustomerJob({
        customerId,
      }));
    
      expectEffectNotEmitted(effects.openCreateCustomerJobDialog, () => {
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customerId,
          },
        }));
      });
    });
  });

  describe('On Update customer job', () => {
    it('should dispatch [Customer API] Update customer job initiated', () => {
      const request = testDataFactory.customer.job.request();
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerJobDialogResult>({
        jobName: job.name,
        ...request,
        customerId,
      }));

      actions$ = of(customerActions.updateCustomerJob({
        customerId,
        ...job,
      }));

      effects.openUpdateCustomerJobDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.updateCustomerJobInitiated({
          customerId,
          jobName: job.name,
          ...request,
        }));
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customerId,
            job,
          },
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customerId = testDataFactory.customer.id();
      const job = testDataFactory.customer.job.response();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerDialogResult>());    

      actions$ = of(customerActions.updateCustomerJob({
        customerId,
        ...job,
      }));
    
      expectEffectNotEmitted(effects.openUpdateCustomerJobDialog, () => {
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customerId,
            job,
          },
        }));
      });
    });
  });

  describe('On Delete customer job', () => {
    it('should dispatch [Customer API] Delete customer job initiated', () => {
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(true));

      actions$ = of(customerActions.deleteCustomerJob({
        customerId,
        name: job.name,
      }));

      effects.openDeleteCustomerJobDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.deleteCustomerJobInitiated({
          customerId,
          jobName: job.name,
        }));
        validateFunctionCall(mockDialogService.openConfirmationDialog, expect.objectContaining({
          content: job.name,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(false));  

      actions$ = of(customerActions.deleteCustomerJob({
        customerId,
        name: job.name,
      }));
    
      expectEffectNotEmitted(effects.openDeleteCustomerJobDialog, () => {
        validateFunctionCall(mockDialogService.openConfirmationDialog, expect.objectContaining({
          content: job.name,
        }));
      });
    });
  });

  describe('On Add customer to blacklist', () => {
    it('should dispatch [Customer API] Add customer to blacklist initiated', () => {
      const alreadyBlacklistedCustomer = testDataFactory.customer.response();
      const customerA = testDataFactory.customer.response({
        blacklistedCustomers: [alreadyBlacklistedCustomer],
      });
      const customerB = testDataFactory.customer.response();

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerAddToBlacklistDialogResult>([
        customerA,
        customerB,
      ]));

      actions$ = of(customerActions.addCustomerToBlacklist({
        customerId: customerA.customerId,
      }));

      effects.openAddCustomerToBlacklistDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.addCustomerToBlacklistInitiated({
          customers: [
            customerA,
            customerB,
          ],
        }));
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customer: customerA,
            excludedCustomerIds: [
              customerA.customerId,
              alreadyBlacklistedCustomer.customerId,
            ],
          },
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const alreadyBlacklistedCustomer = testDataFactory.customer.response();
      const customerA = testDataFactory.customer.response({
        blacklistedCustomers: [alreadyBlacklistedCustomer],
      });

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<CustomerAddToBlacklistDialogResult>());

      actions$ = of(customerActions.addCustomerToBlacklist({
        customerId: customerA.customerId,
      }));
    
      expectEffectNotEmitted(effects.openAddCustomerToBlacklistDialog, () => {
        validateFunctionCall(mockMatDialog.open, expect.anything(), expect.objectContaining({
          data: {
            customer: customerA,
            excludedCustomerIds: [
              customerA.customerId,
              alreadyBlacklistedCustomer.customerId,
            ],
          },
        }));
      });
    });
  });

  describe('On Remove customer to blacklist', () => {
    it('should dispatch [Customer API] Remove customer to blacklist initiated', () => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockDialogService.openConfirmationDialog.mockReturnValue(of(true));

      actions$ = of(customerActions.deleteCustomerFromBlacklist({
        customerId: customerA.customerId,
        selectedCustomer: customerB,
      }));

      effects.openDeleteCustomerFromBlacklistDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.deleteCustomerFromBlacklistInitiated({
          customerIds: [
            customerA.customerId,
            customerB.customerId,
          ],
        }));
        validateFunctionCall(mockDialogService.openConfirmationDialog, expect.objectContaining({
          content: `${customerA.name} és ${customerB.name}`,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockDialogService.openConfirmationDialog.mockReturnValue(of(false));

      actions$ = of(customerActions.deleteCustomerFromBlacklist({
        customerId: customerA.customerId,
        selectedCustomer: customerB,
      }));
    
      expectEffectNotEmitted(effects.openDeleteCustomerFromBlacklistDialog, () => {
        validateFunctionCall(mockDialogService.openConfirmationDialog, expect.objectContaining({
          content: `${customerA.name} és ${customerB.name}`,
        }));
      });
    });
  });
});
