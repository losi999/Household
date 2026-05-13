import { Calendar, Customer, Price } from '@household/shared/types/types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const customerEvents = eventGroup({
  source: 'Customer',
  events: {
    createCustomer: type<void>(),
    updateCustomer: type<Customer.Response>(),
    deleteCustomer: type<Customer.Response>(),
    createCustomerJob: type<Customer.CustomerId>(),
    updateCustomerJob: type<Customer.CustomerId & Customer.Job.Response>(),
    deleteCustomerJob: type<Customer.CustomerId & Customer.Job.Name>(),
    addCustomerToBlacklist: type<Customer.Response>(),
    deleteCustomerFromBlacklist: type<{
      currentCustomer: Customer.Response;
      selectedCustomer: Customer.ResponseBase;
    }>(),
  },
});

export const customerApiEvents = eventGroup({
  source: 'Customer API',
  events: {
    listCustomersInitiated: type<void>(),
    listCustomersCompleted: type<Customer.Response[]>(),
    createCustomerInitiated: type<Customer.Request>(),
    createCustomerCompleted: type<Customer.CustomerId & Customer.Request>(),
    updateCustomerInitiated: type<Customer.CustomerId & Customer.Request>(),
    updateCustomerCompleted: type<Customer.CustomerId & Customer.Request>(),
    updateCustomerFailed: type<Customer.CustomerId>(),
    deleteCustomerInitiated: type<Customer.CustomerId>(),
    deleteCustomerCompleted: type<Customer.CustomerId>(),
    deleteCustomerFailed: type<Customer.CustomerId>(),
    createCustomerJobInitiated: type<Customer.CustomerId & Customer.Job.Request>(),
    createCustomerJobCompleted: type<Customer.CustomerId & Customer.Job.Request & {priceList: Price.Response[]}>(),
    updateCustomerJobInitiated: type<Customer.CustomerId & {jobName: Customer.Job.Name['name']} & Customer.Job.Request>(),
    updateCustomerJobCompleted: type<Customer.CustomerId & {jobName: Customer.Job.Name['name']} & Customer.Job.Request & {priceList: Price.Response[]}>(),    
    deleteCustomerJobInitiated: type<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(),
    deleteCustomerJobCompleted: type<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(),    
    listCustomerWorksInitiated: type<Customer.CustomerId>(),
    listCustomerWorksCompleted: type<Customer.CustomerId & {works: Calendar.Entry.ResponseBase[]}>(),
    addCustomerToBlacklistInitiated: type<Customer.Response[]>(),
    addCustomerToBlacklistCompleted: type<Customer.Response[]>(),
    deleteCustomerFromBlacklistInitiated: type<Customer.Id[]>(),
    deleteCustomerFromBlacklistCompleted: type<Customer.Id[]>(),
  },
});
