import { inject } from '@angular/core';
import { CustomerService } from '@hairdressing/services/customer-service';
import { withCustomerApiEvents } from '@hairdressing/state/customer/with-customer-api-events';
import { withCustomerEvents } from '@hairdressing/state/customer/with-customer-events';
import { withCustomerReducer } from '@hairdressing/state/customer/with-customer-reducer';
import { toSearchTerms } from '@household/shared/common/utils';
import { Searchable } from '@household/shared/types/common';
import { Customer, Calendar } from '@household/shared/types/types';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, pipe, switchMap, tap, throwError } from 'rxjs';

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
);
