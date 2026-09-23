import { CustomerJobReportSort } from '@hairdressing/types';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const customerEvents = eventGroup({
  source: 'Customer',
  events: {
    createCustomer: type<void>(),
    updateCustomer: type<Responses.Customer>(),
    deleteCustomer: type<Responses.Customer>(),
    createCustomerJob: type<Api.Customer.CustomerId>(),
    updateCustomerJob: type<Api.Customer.CustomerId & Responses.CustomerJob>(),
    deleteCustomerJob: type<Api.Customer.CustomerId & Api.Customer.Job.Name>(),
    addCustomerToBlacklist: type<Responses.Customer>(),
    deleteCustomerFromBlacklist: type<{
      currentCustomer: Responses.Customer;
      selectedCustomer: Responses.CustomerLean;
    }>(),
    addPriceFilter: type<Api.Price.PriceId>(),
    removePriceFilter: type<Api.Price.PriceId>(),
    sortJobs: type<{sortBy: CustomerJobReportSort; sortOrder: 'asc' | 'desc'}>(),
  },
});

export const customerApiEvents = eventGroup({
  source: 'Customer API',
  events: {
    listCustomersInitiated: type<void>(),
    listCustomersCompleted: type<Responses.Customer[]>(),
    createCustomerInitiated: type<Requests.Customer>(),
    createCustomerCompleted: type<Api.Customer.CustomerId & Requests.Customer>(),
    updateCustomerInitiated: type<Api.Customer.CustomerId & Requests.Customer>(),
    updateCustomerCompleted: type<Api.Customer.CustomerId & Requests.Customer>(),
    updateCustomerFailed: type<Api.Customer.CustomerId>(),
    deleteCustomerInitiated: type<Api.Customer.CustomerId>(),
    deleteCustomerCompleted: type<Api.Customer.CustomerId>(),
    deleteCustomerFailed: type<Api.Customer.CustomerId>(),
    createCustomerJobInitiated: type<Api.Customer.CustomerId & Requests.CustomerJob>(),
    createCustomerJobCompleted: type<Api.Customer.CustomerId & Requests.CustomerJob & {priceList: Responses.Price[]}>(),
    updateCustomerJobInitiated: type<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']} & Requests.CustomerJob>(),
    updateCustomerJobCompleted: type<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']} & Requests.CustomerJob & {priceList: Responses.Price[]}>(),    
    deleteCustomerJobInitiated: type<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']}>(),
    deleteCustomerJobCompleted: type<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']}>(),    
    listCustomerWorksInitiated: type<Api.Customer.CustomerId>(),
    listCustomerWorksCompleted: type<Api.Customer.CustomerId & {works: Responses.CalendarEntryWorkLean[]}>(),
    addCustomerToBlacklistInitiated: type<Responses.Customer[]>(),
    addCustomerToBlacklistCompleted: type<Responses.Customer[]>(),
    deleteCustomerFromBlacklistInitiated: type<Api.Customer.Id[]>(),
    deleteCustomerFromBlacklistCompleted: type<Api.Customer.Id[]>(),
  },
});
