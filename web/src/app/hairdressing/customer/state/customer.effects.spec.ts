import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerAddToBlacklistDialogResult } from '@household/web/app/hairdressing/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { CustomerDialogResult } from '@household/web/app/hairdressing/customer/customer-dialog/customer-dialog.component';
import { CustomerJobDialogResult } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { CustomerEffects } from '@household/web/app/hairdressing/customer/state/customer.effects';
import { DialogService } from '@household/web/services/dialog.service';
import { expectEffectNotEmitted, returnDialogAfterClosed } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';

describe('Customer effects', () => {
  let actions$: Observable<any>;
  let effects: CustomerEffects;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let store: MockStore;

  beforeEach(() => {
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
          useValue: jasmine.createSpyObj<DialogService>('DialogService', ['openConfirmationDialog']), 
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']), 
        },
      ],
    });

    effects = TestBed.inject(CustomerEffects);
    mockMatDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    store = TestBed.inject(MockStore);
    mockDialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
  });

  describe('On Create customer', () => {
    it('should dispatch [Customer API] Create customer initiated', (done) => {
      const request = testDataFactory.customer.request();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>(request));

      actions$ = of(customerActions.createCustomer());

      effects.openCreateCustomerDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.createCustomerInitiated(request));
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({ }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>());
    
      actions$ = of(customerActions.createCustomer());
    
      expectEffectNotEmitted(effects.openCreateCustomerDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({ }));
        done();
      });
    });
  });

  describe('On Update customer', () => {
    it('should dispatch [Customer API] Update customer initiated', (done) => {
      const customerResponse = testDataFactory.customer.response();
      const request = testDataFactory.customer.request();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>(request));

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
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: customerResponse,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customerResponse = testDataFactory.customer.response();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>());
    
      store.setState({
        customers: {
          customerList: [customerResponse],
        },
      });

      actions$ = of(customerActions.updateCustomer({
        customerId: customerResponse.customerId,
      }));
    
      expectEffectNotEmitted(effects.openUpdateCustomerDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: customerResponse,
        }));
        done();
      });
    });
  });

  describe('On Create customer job', () => {
    it('should dispatch [Customer API] Create customer job initiated', (done) => {
      const request = testDataFactory.customer.job.request();
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerJobDialogResult>({
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
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customerId,
          },
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>());    

      actions$ = of(customerActions.createCustomerJob({
        customerId,
      }));
    
      expectEffectNotEmitted(effects.openCreateCustomerJobDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customerId,
          },
        }));
        done();
      });
    });
  });

  describe('On Update customer job', () => {
    it('should dispatch [Customer API] Update customer job initiated', (done) => {
      const request = testDataFactory.customer.job.request();
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerJobDialogResult>({
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
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customerId,
            job,
          },
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customerId = testDataFactory.customer.id();
      const job = testDataFactory.customer.job.response();

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerDialogResult>());    

      actions$ = of(customerActions.updateCustomerJob({
        customerId,
        ...job,
      }));
    
      expectEffectNotEmitted(effects.openUpdateCustomerJobDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customerId,
            job,
          },
        }));
        done();
      });
    });
  });

  describe('On Delete customer job', () => {
    it('should dispatch [Customer API] Delete customer job initiated', (done) => {
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockDialogService.openConfirmationDialog.and.returnValue(of(true));

      actions$ = of(customerActions.deleteCustomerJob({
        customerId,
        name: job.name,
      }));

      effects.openDeleteCustomerJobDialog.subscribe((result) => {
        expect(result).toEqual(customerApiActions.deleteCustomerJobInitiated({
          customerId,
          jobName: job.name,
        }));
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: job.name,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const job = testDataFactory.customer.job.response();
      const customerId = testDataFactory.customer.id();

      mockDialogService.openConfirmationDialog.and.returnValue(of(false));  

      actions$ = of(customerActions.deleteCustomerJob({
        customerId,
        name: job.name,
      }));
    
      expectEffectNotEmitted(effects.openDeleteCustomerJobDialog, () => {
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: job.name,
        }));
        done();
      });
    });
  });

  describe('On Add customer to blacklist', () => {
    it('should dispatch [Customer API] Add customer to blacklist initiated', (done) => {
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

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerAddToBlacklistDialogResult>([
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
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customer: customerA,
            excludedCustomerIds: [
              customerA.customerId,
              alreadyBlacklistedCustomer.customerId,
            ],
          },
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const alreadyBlacklistedCustomer = testDataFactory.customer.response();
      const customerA = testDataFactory.customer.response({
        blacklistedCustomers: [alreadyBlacklistedCustomer],
      });

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockMatDialog.open.and.returnValue(returnDialogAfterClosed<CustomerAddToBlacklistDialogResult>());

      actions$ = of(customerActions.addCustomerToBlacklist({
        customerId: customerA.customerId,
      }));
    
      expectEffectNotEmitted(effects.openAddCustomerToBlacklistDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
          data: {
            customer: customerA,
            excludedCustomerIds: [
              customerA.customerId,
              alreadyBlacklistedCustomer.customerId,
            ],
          },
        }));
        done();
      });
    });
  });

  describe('On Remove customer to blacklist', () => {
    it('should dispatch [Customer API] Remove customer to blacklist initiated', (done) => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockDialogService.openConfirmationDialog.and.returnValue(of(true));

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
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: `${customerA.name} és ${customerB.name}`,
        }));
        done();
      });
    });

    it('should NOT dispatch if dialog is cancelled', (done) => {
      const customerA = testDataFactory.customer.response();
      const customerB = testDataFactory.customer.response();

      store.setState({
        customers: {
          customerList: [customerA],
        },
      });

      mockDialogService.openConfirmationDialog.and.returnValue(of(false));

      actions$ = of(customerActions.deleteCustomerFromBlacklist({
        customerId: customerA.customerId,
        selectedCustomer: customerB,
      }));
    
      expectEffectNotEmitted(effects.openDeleteCustomerFromBlacklistDialog, () => {
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
          content: `${customerA.name} és ${customerB.name}`,
        }));
        done();
      });
    });
  });
});
