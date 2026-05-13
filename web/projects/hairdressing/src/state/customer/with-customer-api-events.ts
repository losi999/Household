import { inject } from '@angular/core';
import { CustomerService } from '@hairdressing/services/customer-service';
import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withCustomerApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const customerService = inject(CustomerService);
      const priceStore = inject(PriceStore);

      return {
        listCustomers: events.on(customerApiEvents.listCustomersInitiated).pipe(
          exhaustMap(() => {
            return customerService.listCustomers().pipe(
              map((customers) => customerApiEvents.listCustomersCompleted(customers)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        listCustomerWorks: events.on(customerApiEvents.listCustomerWorksInitiated).pipe(
          exhaustMap(({ payload: { customerId } }) => {
            return customerService.listCustomerWorks(customerId).pipe(
              map((works) => customerApiEvents.listCustomerWorksCompleted({
                works,
                customerId,
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createCustomer: events.on(customerApiEvents.createCustomerInitiated).pipe(
          mergeMap(({ payload }) => {
            return customerService.createCustomer(payload).pipe(
              map(({ customerId }) => customerApiEvents.createCustomerCompleted({
                customerId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate customer name': {
                    errorMessage = `Vendég (${payload.name}) már létezik!`;
                  } break;
                  default: {
                    errorMessage = 'Hiba történt';
                  }
                }
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        updateCustomer: events.on(customerApiEvents.updateCustomerInitiated).pipe(
          groupBy(({ payload }) => payload.customerId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { customerId, ...request } }) => {
              return customerService.updateCustomer(customerId, request).pipe(
                map(({ customerId }) => customerApiEvents.updateCustomerCompleted({
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
                  return [
                    customerApiEvents.updateCustomerFailed({
                      customerId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteCustomer: events.on(customerApiEvents.deleteCustomerInitiated).pipe(
          groupBy(({ payload }) => payload.customerId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { customerId } }) => {
              return customerService.deleteCustomer(customerId).pipe(
                map(() => customerApiEvents.deleteCustomerCompleted({
                  customerId,
                })),
                catchError(() => {
                  return [
                    customerApiEvents.deleteCustomerFailed({
                      customerId,
                    }),
                    notificationEvents.showMessage('Hiba történt'),
                  ];
                }),
              );
            }));
          }),
        ),
        createCustomerJob: events.on(customerApiEvents.createCustomerJobInitiated).pipe(
          mergeMap(({ payload: { customerId, ...request } }) => {
            return customerService.createCustomerJob(customerId, request).pipe(
              map(() => customerApiEvents.createCustomerJobCompleted({
                customerId,
                priceList: priceStore.priceList(),
                ...request,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate customer job name': {
                    errorMessage = `Munka (${request.name}) már létezik!`;
                  } break;
                  default: {
                    errorMessage = 'Hiba történt';
                  }
                }
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        updateCustomerJob: events.on(customerApiEvents.updateCustomerJobInitiated).pipe(
          groupBy(({ payload: { customerId } }) => customerId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { customerId, jobName, ...request } }) => {
              return customerService.updateCustomerJob(customerId, jobName, request).pipe(
                map(() => customerApiEvents.updateCustomerJobCompleted({
                  jobName,
                  customerId,
                  priceList: priceStore.priceList(),
                  ...request,
                })),
                catchError((error) => {
                  let errorMessage: string;
                  switch(error.error?.message) {
                    case 'Duplicate customer job name': {
                      errorMessage = `Munka (${request.name}) már létezik!`;
                    } break;
                    default: {
                      errorMessage = 'Hiba történt';
                    }
                  }
                  return [notificationEvents.showMessage(errorMessage)];
                }),
              );
            }));
          }),
        ),
        deleteCustomerJob: events.on(customerApiEvents.deleteCustomerJobInitiated).pipe(
          groupBy(({ payload: { customerId } }) => customerId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { customerId, jobName } }) => {
              return customerService.deleteCustomerJob(customerId, jobName).pipe(
                map(() => customerApiEvents.deleteCustomerJobCompleted({
                  jobName,
                  customerId,
                })),
                catchError(() => {
                  return [notificationEvents.showMessage('Hiba történt')];
                }),
              );
            }));
          }),
        ),
        addCustomerToBlacklist: events.on(customerApiEvents.addCustomerToBlacklistInitiated).pipe(
          groupBy(({ payload }) => payload),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload }) => {
              return customerService.updateCustomerBlacklist(payload.map(c => c.customerId)).pipe(
                map(() => customerApiEvents.addCustomerToBlacklistCompleted(payload)),
                catchError(() => {
                  return [notificationEvents.showMessage('Hiba történt')];
                }),
              );
            }));
          }),
        ),
        deleteCustomerFromBlacklist: events.on(customerApiEvents.deleteCustomerFromBlacklistInitiated).pipe(
          groupBy(({ payload }) => payload),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload }) => {
              return customerService.deleteCustomerBlacklist(payload).pipe(
                map(() => customerApiEvents.deleteCustomerFromBlacklistCompleted(payload)),
                catchError(() => {
                  return [notificationEvents.showMessage('Hiba történt')];
                }),
              );
            }));
          }),
        ),
      };
    }),
  );
};
