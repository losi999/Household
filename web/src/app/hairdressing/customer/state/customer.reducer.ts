import { Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { isPriceBase } from '@household/shared/common/type-guards';

export const customerReducer = createReducer<Customer.Response[]>([],
  on(customerApiActions.listCustomersCompleted, (_state, { customers }) => {
    return customers;
  }),
  on(customerApiActions.createCustomerCompleted, (_state, { customerId, name, description, isGroup, rating }) => {
    return _state.concat({
      customerId,
      name,
      description,
      isGroup,
      rating,
      jobs: [],
      blacklistedCustomers: [],
      workEntries: [],
    })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      }));
  }),

  on(customerApiActions.updateCustomerCompleted, (_state, { customerId, name, description, isGroup, rating }) => {   
    return _state.map((c) => {
      if (c.customerId !== customerId) {
        return c;
      }
      return {
        ...c,
        name,
        description,
        isGroup,
        rating,
      };
    }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
      sensitivity: 'base',
    }));
  }),

  on(customerApiActions.createCustomerJobCompleted, (_state, { customerId, duration, name, prices, description, priceList }) => {
    return _state.map((c) => {
      return c.customerId !== customerId ? c : {
        ...c,
        jobs: c.jobs.concat({
          name,
          prices: prices.map((p) => {
            if (isPriceBase(p)) {
              return {
                amount: p.amount,
                name: p.name,
                priceId: undefined,
                quantity: undefined,
                unitOfMeasurement: undefined,
              };
            }

            const price = priceList.find(x => x.priceId === p.priceId);
            return {
              ...price,
              quantity: p.quantity,
            };
          }),
          duration,
          description,
        })
          .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
            sensitivity: 'base',
          })),
      };
    });
  }),

  on(customerApiActions.deleteCustomerJobCompleted, (_state, { customerId, jobName }) => {   
    return _state.map(c => {
      return c.customerId !== customerId ? c : {
        ...c,
        jobs: c.jobs.filter(j => j.name !== jobName),
      };
    });
  }),

  on(customerApiActions.updateCustomerJobCompleted, (_state, { customerId, jobName, description, duration, name, prices, priceList }) => {
    return _state.map((c) => {
      return c.customerId !== customerId ? c : {
        ...c,
        jobs: c.jobs.map((j) => {
          return j.name !== jobName ? j : {
            name,
            prices: prices.map((p) => {
              if (isPriceBase(p)) {
                return {
                  amount: p.amount,
                  name: p.name,
                  priceId: undefined,
                  quantity: undefined,
                  unitOfMeasurement: undefined,
                };
              }

              const price = priceList.find(x => x.priceId === p.priceId);
              return {
                ...price,
                quantity: p.quantity,
              };
            }),
            duration,
            description,
          };
        }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
      };
    });
  }),

  on(customerApiActions.addCustomerToBlacklistCompleted, (_state, { customers }) => {
    return _state.map((customer) => {
      const index = customers.findIndex((c) => c.customerId === customer.customerId);
      if (index < 0) {
        return customer;
      }

      return {
        ...customer, 
        blacklistedCustomers: [
          ...customer.blacklistedCustomers,
          index === 0 ? customers[1] : customers[0],
        ],
      };
    });
  }),

  on(customerApiActions.deleteCustomerFromBlacklistCompleted, (_state, { customerIds }) => {
    return _state.map((customer) => {
      if (!customerIds.includes(customer.customerId)) {
        return customer;
      }

      return {
        ...customer, 
        blacklistedCustomers: customer.blacklistedCustomers.filter(({ customerId }) => !customerIds.includes(customerId)),
      };
    });
  }),
);
