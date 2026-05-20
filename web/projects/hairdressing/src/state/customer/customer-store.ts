import { computed } from '@angular/core';
import { withCustomerApiEvents } from '@hairdressing/state/customer/with-customer-api-events';
import { withCustomerEvents } from '@hairdressing/state/customer/with-customer-events';
import { withCustomerReducer } from '@hairdressing/state/customer/with-customer-reducer';
import { Searchable } from '@household/shared/types/common';
import { Customer, Calendar } from '@household/shared/types/types';
import { signalStore, withComputed, withState } from '@ngrx/signals';

export type CustomerState = { 
  customerList: Searchable<Customer.Response>[];
  isInProgress: Customer.Id[];
  customerWorks: {
    [customerId: Customer.Id]: Calendar.Entry.WorkEntryResponseBase[];
  };
};

export const CustomerStore = signalStore({
  providedIn: 'root',
}, 
withState<CustomerState>({
  customerList: [],
  customerWorks: {},
  isInProgress: [],
}),
withCustomerReducer(),
withCustomerEvents(),
withCustomerApiEvents(),
withComputed((store) => {
  return {
    jobList: computed(() => {
      return store.customerList().flatMap(c => {
        if (!c.isArchived) {
          return c.jobs;
        }

        return [];
      });
    }),
  };
}),
);
