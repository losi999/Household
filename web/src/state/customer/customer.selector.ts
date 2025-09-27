import { Customer } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCustomers = createFeatureSelector<Customer.Response[]>('customers');

export const selectFilteredCustomers = (...excludedIds: Customer.Id[]) => createSelector(selectCustomers, (customers) => {
  return customers.filter(c => !excludedIds?.includes(c.customerId));
});

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, (customers) => {
  return customers?.find(c => c.customerId === customerId);
});
