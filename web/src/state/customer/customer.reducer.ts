import { Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { customerApiActions } from '@household/web/state/customer/customer.actions';

export const customerReducer = createReducer<Customer.Response[]>([],
  on(customerApiActions.listCustomersCompleted, (_state, { customers }) => {
    return customers;
  }),
  // on(customerApiActions.createCustomerCompleted, customerApiActions.updateCustomerCompleted, (_state, { customerId, name }) => {

  //   return _state.filter(p => p.customerId !== customerId)
  //     .concat({
  //       customerId,
  //       name,
  //     })
  //     .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
  //       sensitivity: 'base',
  //     }));
  // }),
  // on(customerApiActions.deleteCustomerCompleted, (_state, { customerId }) => {
  //   return _state.filter(p => p.customerId !== customerId);
  // }),
  // on(customerApiActions.mergeCustomersCompleted, (_state, { sourceCustomerIds }) => {
  //   return _state.filter(p => !sourceCustomerIds.includes(p.customerId));
  // }),
);
