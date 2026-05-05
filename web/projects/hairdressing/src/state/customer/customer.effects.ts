import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, filter, map, mergeMap, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { DialogService, dispatchIfConfirmed, takeFirstDefined } from '@household/shared-ui';
import { customerActions, customerApiActions } from '@hairdressing/state/customer/customer.actions';
import { CustomerDialog, CustomerDialogData, CustomerDialogResult } from '@hairdressing/app/customer/customer-dialog/customer-dialog';
import { selectCustomerById } from '@hairdressing/state/customer/customer.selector';
import { CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult } from '@hairdressing/app/customer/customer-job-dialog/customer-job-dialog';

@Injectable()
export class CustomerEffects {
  private readonly actions = inject(Actions);
  private readonly dialog = inject(MatDialog);
  private readonly dialogService = inject(DialogService);
  private readonly store = inject(Store);
  
  openCreateCustomerDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.createCustomer),
      exhaustMap(() => {
        return this.dialog.open<CustomerDialog, CustomerDialogData, CustomerDialogResult>(CustomerDialog, {
          disableClose: true,
          maxHeight: '90vh',
        }).afterClosed();
      }),
      filter(req => !!req),
      map((request) => {
        return customerApiActions.createCustomerInitiated(request);
      }),
    );
  });
  
  openUpdateCustomerDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.updateCustomer),
      switchMap(({ customerId }) => this.store.select(selectCustomerById(customerId)).pipe(takeFirstDefined())),
      exhaustMap((customer) => {
        return this.dialog.open<CustomerDialog, CustomerDialogData, CustomerDialogResult>(CustomerDialog, {
          data: customer,
          disableClose: true,
        }).afterClosed()
          .pipe(filter(req => !!req),
            map((request) => {
              return customerApiActions.updateCustomerInitiated({
                customerId: customer.customerId,
                ...request,
              });
            }));
      }),
    );
  });
    
  openDeleteCustomerDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.deleteCustomer),
      exhaustMap(({ type, ...customer }) => {
        return this.dialogService.openConfirmationDialog({
          title: 'Törölni akarod ezt a vendéget?',
          content: customer.name,
        }).pipe(
          dispatchIfConfirmed(customerApiActions.deleteCustomerInitiated({
            customerId: customer.customerId,
          })),
        );
      }),
    );
  });
  
  openCreateCustomerJobDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.createCustomerJob),
      exhaustMap(({ customerId }) => {
        return this.dialog.open<CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialog, {
          data: {
            customerId,
          },
          width: '900px',
          maxHeight: '90vh',
          disableClose: true,
        }).afterClosed();
      }),
      filter(req => !!req),
      map(({ customerId, jobName, ...request }) => {
        return customerApiActions.createCustomerJobInitiated({
          customerId, 
          ...request,
        });
      }),
    );
  });
  
  openUpdateCustomerJobDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.updateCustomerJob),
      exhaustMap(({ type, customerId, ...job }) => {
        return this.dialog.open<CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialog, {
          data: {
            customerId,
            job,
          },
          width: '900px',
          maxHeight: '90vh',
          disableClose: true,
        }).afterClosed()
          .pipe(
            filter(req => !!req),
            map(({ customerId, jobName, ...request }) => {
              return customerApiActions.updateCustomerJobInitiated({
                customerId,
                jobName,
                ...request,
              });
            }),
          );
      }),
    );
  });
  
  openDeleteCustomerJobDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.deleteCustomerJob),
      exhaustMap(({ customerId, name }) => {
        return this.dialogService.openConfirmationDialog({
          title: 'Törölni akarod ezt a munkát?', 
          content: name,
        }).pipe(
          dispatchIfConfirmed(customerApiActions.deleteCustomerJobInitiated({
            customerId,
            jobName: name,
          })));
      }),
    );
  });
  
  // openAddCustomerToBlacklistDialog = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(customerActions.addCustomerToBlacklist),
  //     switchMap(({ customerId }) => this.store.select(selectCustomerById(customerId)).pipe(takeFirstDefined())), 
  //     exhaustMap((customer) => {
  //       return this.dialog.open<CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult>(CustomerAddToBlacklistDialogComponent, {
  //         data: {
  //           customer,
  //           excludedCustomerIds: [
  //             customer.customerId,
  //             ...customer.blacklistedCustomers.map(c => c.customerId),
  //           ],
  //         },
  //         disableClose: true,
  //       }).afterClosed();
  //     }),
  //     filter(req => !!req),
  //     map((customers) => {
  //       return customerApiActions.addCustomerToBlacklistInitiated({
  //         customers,
  //       });
  //     }),
  //   );
  // });
  
  openDeleteCustomerFromBlacklistDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.deleteCustomerFromBlacklist),
      exhaustMap(({ customerId, selectedCustomer }) => {
        return this.store.select(selectCustomerById(customerId)).pipe(
          takeFirstDefined(), 
          mergeMap((customer) => {
            return this.dialogService.openConfirmationDialog({
              title: 'Törölni akarod a tiltást közöttük?',
              content: `${customer.name} és ${selectedCustomer.name}`,
            }).pipe(
              dispatchIfConfirmed(customerApiActions.deleteCustomerFromBlacklistInitiated({
                customerIds: [
                  customer.customerId,
                  selectedCustomer.customerId,
                ],
              })),
            );
          }));
      }),
    );
  });
}

