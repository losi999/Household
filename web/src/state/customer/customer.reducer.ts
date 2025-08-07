import { Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { customerApiActions } from '@household/web/state/customer/customer.actions';

export type CustomerState = {
  customerList?: Customer.Response[];
  selectedCustomer?: Customer.Response;
};

export const customerReducer = createReducer<CustomerState>({},
  on(customerApiActions.listCustomersInitiated, (_state) => {
    return {
      ..._state,
      selectedCustomer: undefined,
    };
  }),

  on(customerApiActions.getCustomerByIdInitiated, (_state, { customerId }) => {
    return {
      ..._state,
      selectedCustomer: _state.customerList?.find(c => c.customerId === customerId),
    };
  }),

  on(customerApiActions.getCustomerByIdCompleted, (_state, { type, ...customer }) => {
    return {
      ..._state,
      selectedCustomer: customer,
    };
  }),

  on(customerApiActions.listCustomersCompleted, (_state, { customers }) => {
    return {
      ..._state,
      customerList: customers,
    };
  }),
  on(customerApiActions.createCustomerCompleted, (_state, { customerId, name, description }) => {
    return {
      ..._state,
      customerList: _state.customerList.filter(p => p.customerId !== customerId)
        .concat({
          customerId,
          name,
          description,
          jobs: [],
        })
        .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
    };
  }),

  on(customerApiActions.updateCustomerCompleted, (_state, { customerId, name, description }) => {
    return {
      ..._state,
      customerList: _state.customerList?.filter(p => p.customerId !== customerId)
        .concat({
          customerId,
          name,
          description,
          jobs: _state.selectedCustomer.jobs,
        })
        .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
      selectedCustomer: {
        customerId,
        name,
        description,
        jobs: _state.selectedCustomer.jobs,
      },
    };
  }),

  on(customerApiActions.createCustomerJobCompleted, (_state, { customerId, duration, name, price, description }) => {
    const newJob: Customer.Job = {
      name,
      price,
      duration,
      description,
    };
    return {
      ..._state,
      customerList: _state.customerList?.map(c => {
        return c.customerId !== customerId ? c : {
          ...c,
          jobs: [
            ...c.jobs,
            newJob,
          ],
        };
      }),
      selectedCustomer: {
        ..._state.selectedCustomer,
        jobs: [
          ..._state.selectedCustomer.jobs,
          newJob,
        ],
      },
    };
  }),

  on(customerApiActions.deleteCustomerJobCompleted, (_state, { customerId, jobName }) => {
    const jobs = _state.selectedCustomer.jobs.filter(j => j.name !== jobName);
    
    return {
      ..._state,
      customerList: _state.customerList?.map(c => {
        return c.customerId !== customerId ? c : {
          ...c,
          jobs,
        };
      }),
      selectedCustomer: {
        ..._state.selectedCustomer,
        jobs,
      },
    };
  }),

  on(customerApiActions.updateCustomerJobCompleted, (_state, { customerId, jobName, description, duration, name, price }) => {
    const jobs = _state.selectedCustomer.jobs.filter(j => j.name !== jobName).concat({
      description,
      duration,
      name,
      price,
    })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      }));
    
    return {
      ..._state,
      customerList: _state.customerList?.map(c => {
        return c.customerId !== customerId ? c : {
          ...c,
          jobs,
        };
      }),
      selectedCustomer: {
        ..._state.selectedCustomer,
        jobs,
      },
    };
  }),
);
