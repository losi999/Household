import { CustomerState } from '@household/web/state/customer/customer.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectCustomers = createFeatureSelector<CustomerState>('customers');

export const selectCustomerList = createSelector(selectCustomers, ({ customerList }) => {
  return customerList;
});

export const selectCustomer = createSelector(selectCustomers, ({ selectedCustomer }) => {
  return selectedCustomer;
});
