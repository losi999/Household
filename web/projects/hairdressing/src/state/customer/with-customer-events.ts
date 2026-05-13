import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomerAddToBlacklistDialog, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult } from '@hairdressing/app/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog';
import { CustomerDialog, CustomerDialogData, CustomerDialogResult } from '@hairdressing/app/customer/customer-dialog/customer-dialog';
import { CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult } from '@hairdressing/app/customer/customer-job-dialog/customer-job-dialog';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';

export const withCustomerEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);

      return {
        openCreateCustomerDialog: events.on(customerEvents.createCustomer).pipe(
          exhaustMap(() => {
            return dialog.open<CustomerDialog, CustomerDialogData, CustomerDialogResult>(CustomerDialog, {
              disableClose: true,
              maxHeight: '90vh',
            }).afterClosed();
          }),
          filter(req => !!req),
          map((request) => {
            return customerApiEvents.createCustomerInitiated(request);
          }),
        ),
        openUpdateCustomerDialog: events.on(customerEvents.updateCustomer).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<CustomerDialog, CustomerDialogData, CustomerDialogResult>(CustomerDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return customerApiEvents.updateCustomerInitiated({
                    customerId: payload.customerId,
                    ...request,
                  });
                }));
          }),
        ),
        openDeleteCustomerDialog: events.on(customerEvents.deleteCustomer).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a vendéget?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(customerApiEvents.deleteCustomerInitiated({
                customerId: payload.customerId,
              })),
            );
          }),
        ),
        openCreateCustomerJobDialog: events.on(customerEvents.createCustomerJob).pipe(
          exhaustMap(({ payload: { customerId } }) => {
            return dialog.open<CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialog, {
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
            return customerApiEvents.createCustomerJobInitiated({
              customerId, 
              ...request,
            });
          }),
        ),
        openUpdateCustomerJobDialog: events.on(customerEvents.updateCustomerJob).pipe(
          exhaustMap(({ payload: { customerId, ...job } }) => {
            return dialog.open<CustomerJobDialog, CustomerJobDialogData, CustomerJobDialogResult>(CustomerJobDialog, {
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
                  return customerApiEvents.updateCustomerJobInitiated({
                    customerId,
                    jobName,
                    ...request,
                  });
                }),
              );
          }),
        ),
        openDeleteCustomerJobDialog: events.on(customerEvents.deleteCustomerJob).pipe(
          exhaustMap(({ payload: { customerId, name } }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a munkát?', 
              content: name,
            }).pipe(
              dispatchIfConfirmed(customerApiEvents.deleteCustomerJobInitiated({
                customerId,
                jobName: name,
              })));
          })),
        openAddCustomerToBlacklistDialog: events.on(customerEvents.addCustomerToBlacklist).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<CustomerAddToBlacklistDialog, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult>(CustomerAddToBlacklistDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed();
          }),
          filter(req => !!req),
          map((customers) => {
            return customerApiEvents.addCustomerToBlacklistInitiated(customers);
          }),
        ),
        openDeleteCustomerFromBlacklistDialog: events.on(customerEvents.deleteCustomerFromBlacklist).pipe(
          exhaustMap(({ payload: { currentCustomer, selectedCustomer } }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod a tiltást közöttük?',
              content: `${currentCustomer.name} és ${selectedCustomer.name}`,
            }).pipe(
              dispatchIfConfirmed(customerApiEvents.deleteCustomerFromBlacklistInitiated([
                currentCustomer.customerId,
                selectedCustomer.customerId,
              ])),
            );
          }),
        ),
      };
    }),
  );
};
