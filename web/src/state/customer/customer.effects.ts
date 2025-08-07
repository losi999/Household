import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { CustomerService } from '@household/web/services/customer.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class CustomerEffects {
  constructor(private actions: Actions, private customerService: CustomerService) {}

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

  getCustomerById = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.getCustomerByIdInitiated),
      exhaustMap(({ customerId }) => {
        return this.customerService.getCustomerById(customerId).pipe(
          map((customer) => customerApiActions.getCustomerByIdCompleted(customer)),
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
      mergeMap(({ type, customerId, ...request }) => {
        return this.customerService.createCustomerJob(customerId, request).pipe(
          map(() => customerApiActions.createCustomerJobCompleted({
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

  updateCustomerJob = createEffect(() => {
    return this.actions.pipe(
      ofType(customerApiActions.updateCustomerJobInitiated),
      groupBy(({ customerId }) => customerId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, customerId, jobName, ...request }) => {
          return this.customerService.updateCustomerJob(customerId, jobName, request).pipe(
            map(() => customerApiActions.updateCustomerJobCompleted({
              jobName,
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

  // deleteCustomer = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(customerApiActions.deleteCustomerInitiated),
  //     mergeMap(({ customerId }) => {
  //       return this.customerService.deleteCustomer(customerId).pipe(
  //         map(() => customerApiActions.deleteCustomerCompleted({
  //           customerId,
  //         })),
  //         catchError(() => {
  //           return of(customerApiActions.deleteCustomerFailed({
  //             customerId,
  //           }), progressActions.processFinished(),
  //           notificationActions.showMessage({
  //             message: 'Hiba történt',
  //           }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });

  // mergeCustomers = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(customerApiActions.mergeCustomersInitiated),
  //     exhaustMap(({ sourceCustomerIds, targetCustomerId }) => {
  //       return this.customerService.mergeCustomers(targetCustomerId, sourceCustomerIds).pipe(
  //         map(() => customerApiActions.mergeCustomersCompleted({
  //           sourceCustomerIds,
  //         })),
  //         catchError(() => {
  //           return of(customerApiActions.mergeCustomersFailed({
  //             sourceCustomerIds,
  //           }), progressActions.processFinished(),
  //           notificationActions.showMessage({
  //             message: 'Hiba történt',
  //           }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });
}

