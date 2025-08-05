import { Customer } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCustomers = createFeatureSelector<Customer.Response[]>('customers');

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, (customers) => {
  return customers.find(a => a.customerId === customerId);
});
