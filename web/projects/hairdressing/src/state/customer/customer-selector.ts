import { Params } from '@angular/router';
import { CustomerState } from '@hairdressing/state/customer/customer-reducer';
import { selectQueryParams } from '@hairdressing/state/router/router-selector';
import { CustomerJob } from '@hairdressing/types';
import { Customer } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectCustomers = createFeatureSelector<CustomerState>('customer');

export const selectCustomerList = createSelector(selectCustomers, ({ customerList }) => {
  return customerList;
});

export const selectCustomerIsInProgress = (priceId: Customer.Id) => createSelector(
  selectCustomers, ({ isInProgress }) => {
    return isInProgress.includes(priceId);
  },
);  

export const selectCustomerById = (customerId: Customer.Id) => createSelector(selectCustomers, ({ customerList }) => {
  return customerList?.find(c => c.customerId === customerId);
});

export const selectCustomerWorks = (customerId: Customer.Id) => createSelector(selectCustomers, ({ customerWorks }) => {
  return customerWorks?.[customerId];
});

export const selectPendingCustomerJob = createSelector<CustomerState, CustomerState, Params, CustomerJob>(selectCustomers, selectQueryParams, ({ customerList }, { customerId, jobName }) => {
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
