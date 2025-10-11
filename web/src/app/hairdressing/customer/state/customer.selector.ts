import { Customer } from '@household/shared/types/types';
import { CustomerJob } from '@household/web/types/common';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectCustomers = createFeatureSelector<Customer.Response[]>('customers');

export const selectFilteredCustomers = (...excludedIds: Customer.Id[]) => createSelector(selectCustomers, (customers) => {
  return customers.filter(c => !excludedIds?.includes(c.customerId));
});

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, (customers) => {
  return customers?.find(c => c.customerId === customerId);
});

export const selectCustomerJobByIdAndName = (customerId: Customer.Id, jobName: string) => createSelector<Customer.Response[], Customer.Response[], CustomerJob>(selectCustomers, (customers) => {
  const customer = customers?.find(c => c.customerId === customerId);
  if(!customer) {
    return undefined;
  }
  
  const job = customer.jobs.find(j => j.name === jobName);

  return {
    ...job,
    customer,
  };
});
