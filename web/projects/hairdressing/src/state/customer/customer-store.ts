import { computed } from '@angular/core';
import { withCustomerApiEvents } from '@hairdressing/state/customer/with-customer-api-events';
import { withCustomerEvents } from '@hairdressing/state/customer/with-customer-events';
import { withCustomerReducer } from '@hairdressing/state/customer/with-customer-reducer';
import { CustomerJobReport, CustomerJobReportSort } from '@hairdressing/types';
import { Searchable } from '@household/shared/types/common';
import { Customer, Calendar, Price } from '@household/shared/types/types';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export type CustomerState = { 
  customerList: Searchable<Customer.Response>[];
  isInProgress: Customer.Id[];
  customerWorks: {
    [customerId: Customer.Id]: Calendar.Entry.WorkEntryResponseBase[];
  };
  priceIdFilters: Price.Id[];
  jobListSortBy: CustomerJobReportSort;
  jobListSortOrder: 'asc' | 'desc'
};

export const CustomerStore = signalStore({
  providedIn: 'root',
}, 
withState<CustomerState>({
  customerList: [],
  customerWorks: {},
  isInProgress: [],
  priceIdFilters: [],
  jobListSortBy: undefined,
  jobListSortOrder: undefined,
}),
withCustomerReducer(),
withCustomerEvents(),
withCustomerApiEvents(),
withComputed((store) => {
  return {
    jobList: computed<CustomerJobReport[]>(() => {
      const list = store.customerList().flatMap(c => {
        if (c.isArchived) {
          return [];
        }

        return c.jobs.filter(j => {
          if (store.priceIdFilters().length === 0) {
            return true;
          }

          return j.prices.some(p => store.priceIdFilters().includes(p.priceId));
        }).map<CustomerJobReport>(j => {
          const total = j.prices.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.amount * currentValue.quantity);
          }, j.additionalPrice ?? 0);

          return {
            customerId: c.customerId,
            customerName: c.name,
            jobName: j.name,
            duration: j.duration,
            total,
            hourlyRate: total / (j.duration / 4),
            prices: j.prices,
          };
        });
      });

      if (!store.jobListSortBy() || !store.jobListSortOrder()) {
        return list;
      }

      const sorted = list.toSorted((a, b) => a[store.jobListSortBy()] > b[store.jobListSortBy()] ? 1 : -1);

      return store.jobListSortOrder() === 'asc' ? sorted : sorted.toReversed();
    }),
  };
}),
);
