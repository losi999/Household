import { Customer } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const customerApiActions = createActionGroup({
  source: 'Customer API',
  events: {
    'List customers initiated': emptyProps(),
    'List customers completed': props<{customers: Customer.Response[]}>(),
    // 'Create customer initiated': props<Customer.Request>(),
    // 'Create customer completed': props<Customer.CustomerId & Customer.Request>(),
    // 'Merge customers initiated': props<{
    //   sourceCustomerIds: Customer.Id[];
    //   targetCustomerId: Customer.Id;
    // }>(),
    // 'Merge customers completed': props<{sourceCustomerIds: Customer.Id[]}>(),
    // 'Merge customers failed': props<{sourceCustomerIds: Customer.Id[]}>(),
    // 'Update customer initiated': props<Customer.CustomerId & Customer.Request>(),
    // 'Update customer completed': props<Customer.CustomerId & Customer.Request>(),
    // 'Delete customer initiated': props<Customer.CustomerId>(),
    // 'Delete customer completed': props<Customer.CustomerId>(),
    // 'Delete customer failed': props<Customer.CustomerId>(),
  },
});
