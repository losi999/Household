import { Customer } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

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
    'Create customer job initiated': props<Customer.CustomerId & Customer.Job>(),
    'Create customer job completed': props<Customer.CustomerId & Customer.Job>(),
    'Update customer job initiated': props<Customer.CustomerId & {jobName: Customer.JobName['name']} & Customer.Job>(),
    'Update customer job completed': props<Customer.CustomerId & {jobName: Customer.JobName['name']} & Customer.Job>(),    
    'Delete customer job initiated': props<Customer.CustomerId & {jobName: Customer.JobName['name']}>(),
    'Delete customer job completed': props<Customer.CustomerId & {jobName: Customer.JobName['name']}>(),    
    // 'Delete customer initiated': props<Customer.CustomerId>(),
    // 'Delete customer completed': props<Customer.CustomerId>(),
    // 'Delete customer failed': props<Customer.CustomerId>(),
  },
});
