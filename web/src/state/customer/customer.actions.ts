import { Customer, Price } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const customerApiActions = createActionGroup({
  source: 'Customer API',
  events: {
    'List customers initiated': emptyProps(),
    'List customers completed': props<{customers: Customer.Response[]}>(),
    'Get customer by id initiated': props<Customer.CustomerId>(),
    'Get customer by id completed': props<Customer.Response>(),
    'Create customer initiated': props<Customer.Request>(),
    'Create customer completed': props<Customer.CustomerId & Customer.Request>(),
    'Update customer initiated': props<Customer.CustomerId & Customer.Request>(),
    'Update customer completed': props<Customer.CustomerId & Customer.Request>(),
    'Create customer job initiated': props<Customer.CustomerId & Customer.Job.Request>(),
    'Create customer job completed': props<Customer.CustomerId & Customer.Job.Request & {priceList: Price.Response[]}>(),
    'Update customer job initiated': props<Customer.CustomerId & {jobName: Customer.Job.Name['name']} & Customer.Job.Request>(),
    'Update customer job completed': props<Customer.CustomerId & {jobName: Customer.Job.Name['name']} & Customer.Job.Request & {priceList: Price.Response[]}>(),    
    'Delete customer job initiated': props<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(),
    'Delete customer job completed': props<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(),    
  },
});
