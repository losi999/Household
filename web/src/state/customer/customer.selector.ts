import { Customer } from '@household/shared/types/types';
import { CustomerState } from '@household/web/state/customer/customer.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectCustomers = createFeatureSelector<CustomerState>('customers');

export const selectCustomerList = createSelector(selectCustomers, ({ customerList }) => {
  return customerList;
});

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, ({ customerList }) => {
  return customerList?.find(c => c.customerId === customerId);
});

export const selectCustomer = createSelector(selectCustomers, ({ selectedCustomer }) => {
  return selectedCustomer;
});
