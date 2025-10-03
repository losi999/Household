import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of, withLatestFrom } from 'rxjs';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { CustomerService } from '@household/web/services/customer.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { selectPrices } from '@household/web/app/hairdressing/price/state/price.selector';
import { Store } from '@ngrx/store';

@Injectable()
export class CustomerEffects {
  constructor(private actions: Actions, private customerService: CustomerService, private store: Store) {}

  loadCustomers = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.listCustomersInitiated),
      exhaustMap(() => {
        return this.customerService.listCustomers().pipe(
          map((customers) => customerApiActions.listCustomersCompleted({
            customers,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createCustomer = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.createCustomerInitiated),
      mergeMap(({ type, ...request }) => {
        return this.customerService.createCustomer(request).pipe(
          map(({ customerId }) => customerApiActions.createCustomerCompleted({
            customerId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate customer name': {
                errorMessage = `Vendég (${request.name}) már létezik!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateCustomer = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.updateCustomerInitiated),
      groupBy(({ customerId }) => customerId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, customerId, ...request }) => {
          return this.customerService.updateCustomer(customerId, request).pipe(
            map(({ customerId }) => customerApiActions.updateCustomerCompleted({
              customerId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate customer name': {
                  errorMessage = `Partner (${request.name}) már létezik!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));
      }),
    );
  });

  createCustomerJob = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.createCustomerJobInitiated),
      withLatestFrom(this.store.select(selectPrices)),
      mergeMap(([
        { type, customerId, ...request },
        priceList,
      ]) => {
        return this.customerService.createCustomerJob(customerId, request).pipe(
          map(() => customerApiActions.createCustomerJobCompleted({
            customerId,
            priceList,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate customer name': {
                errorMessage = `Vendég (${request.name}) már létezik!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateCustomerJob = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.updateCustomerJobInitiated),
      groupBy(({ customerId }) => customerId),
      withLatestFrom(this.store.select(selectPrices)),
      mergeMap(([
        value,
        priceList,
      ]) => {
        return value.pipe(exhaustMap(({ type, customerId, jobName, ...request }) => {
          return this.customerService.updateCustomerJob(customerId, jobName, request).pipe(
            map(() => customerApiActions.updateCustomerJobCompleted({
              jobName,
              customerId,
              priceList,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate customer name': {
                  errorMessage = `Partner (${request.name}) már létezik!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));
      }),
    );
  });

  deleteCustomerJob = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.deleteCustomerJobInitiated),
      groupBy(({ customerId }) => customerId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ customerId, jobName }) => {
          return this.customerService.deleteCustomerJob(customerId, jobName).pipe(
            map(() => customerApiActions.deleteCustomerJobCompleted({
              jobName,
              customerId,
            })),
            catchError(() => {
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: 'Hiba történt',
                }),
              );
            }),
          );
        }));
      }),
    );
  });

  addCustomerToBlacklist = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.addCustomerToBlacklistInitiated),
      groupBy(({ customers }) => customers),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ customers }) => {
          return this.customerService.updateCustomerBlacklist(customers.map(c => c.customerId)).pipe(
            map(() => customerApiActions.addCustomerToBlacklistCompleted({
              customers,
            })),
            catchError(() => {
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: 'Hiba történt',
                }),
              );
            }),
          );
        }));
      }),
    );
  });

  deleteCustomerFromBlacklist = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.deleteCustomerFromBlacklistInitiated),
      groupBy(({ customerIds }) => customerIds),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ customerIds }) => {
          return this.customerService.deleteCustomerBlacklist(customerIds).pipe(
            map(() => customerApiActions.deleteCustomerFromBlacklistCompleted({
              customerIds,
            })),
            catchError(() => {
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: 'Hiba történt',
                }),
              );
            }),
          );
        }));
      }),
    );
  });
}

