import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, filter, map, mergeMap, switchMap } from 'rxjs';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { Store } from '@ngrx/store';
import { DialogService } from '@household/web/services/dialog.service';
import { selectCustomerById } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDialogComponent, CustomerDialogData, CustomerDialogResult } from '@household/web/app/hairdressing/customer/customer-dialog/customer-dialog.component';
import { CustomerJobDialogComponent, CustomerJobDialogData, CustomerJobDialogResult } from '@household/web/app/hairdressing/customer/customer-job-dialog/customer-job-dialog.component';
import { CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult } from '@household/web/app/hairdressing/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { dispatchIfConfirmed } from '@household/web/operators/dispatch-if-confirmed';

@Injectable()
export class CustomerEffects {
  constructor(private actions: Actions, private dialog: MatDialog, private dialogService: DialogService, private store: Store) {}

  openCreateCustomerDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.createCustomer),
      exhaustMap(() => {
        return this.dialog.open<CustomerDialogComponent, CustomerDialogData, CustomerDialogResult>(CustomerDialogComponent, {
          disableClose: true,
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
        return this.dialog.open<CustomerDialogComponent, CustomerDialogData, CustomerDialogResult>(CustomerDialogComponent, {
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
        return this.dialog.open<CustomerJobDialogComponent, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialogComponent, {
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
        return this.dialog.open<CustomerJobDialogComponent, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialogComponent, {
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
  
  openAddCustomerToBlacklistDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(customerActions.addCustomerToBlacklist),
      switchMap(({ customerId }) => this.store.select(selectCustomerById(customerId)).pipe(takeFirstDefined())), 
      exhaustMap((customer) => {
        return this.dialog.open<CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult>(CustomerAddToBlacklistDialogComponent, {
          data: {
            customer,
            excludedCustomerIds: [
              customer.customerId,
              ...customer.blacklistedCustomers.map(c => c.customerId),
            ],
          },
          disableClose: true,
        }).afterClosed();
      }),
      filter(req => !!req),
      map((customers) => {
        return customerApiActions.addCustomerToBlacklistInitiated({
          customers,
        });
      }),
    );
  });
  
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

