import { Customer } from '@household/shared/types/types';
import { CustomerState } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { CustomerJob } from '@household/web/types/common';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectCustomers = createFeatureSelector<CustomerState>('customers');

export const selectCustomerList = (showArchived: boolean) => createSelector(selectCustomers, ({ customerList }) => {
  return showArchived ? customerList : customerList?.filter(c => !c.isArchived);
});

export const selectFilteredCustomers = (...excludedIds: Customer.Id[]) => createSelector(selectCustomers, ({ customerList }) => {
  return customerList?.filter(c => !excludedIds?.includes(c.customerId) && !c.isArchived);
});

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, ({ customerList }) => {
  return customerList?.find(c => c.customerId === customerId);
});

export const selectCustomerWorks = (customerId: Customer.Id) => createSelector(selectCustomers, ({ customerWorks }) => {
  return customerWorks?.[customerId];
});

export const selectCustomerJobByIdAndName = (customerId: Customer.Id, jobName: string) => createSelector<CustomerState, CustomerState, CustomerJob>(selectCustomers, ({ customerList }) => {
  const customer = customerList?.find(c => c.customerId === customerId);
  if(!customer) {
    return undefined;
  }
  
  const job = customer.jobs.find(j => j.name === jobName);

  return {
    ...job,
    customer,
  };
});
