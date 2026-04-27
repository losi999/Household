import { Calendar, Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { isPriceBase } from '@household/shared/common/type-guards';
import { Searchable } from '@household/shared/types/common';
import { toSearchTerms } from '@household/shared/common/utils';

export type CustomerState = { 
  customerList?: Searchable<Customer.Response>[];
  customerWorks?: {
    [customerId: Customer.Id]: Calendar.Entry.WorkEntryResponseBase[];
  };
};

export const customerReducer = createReducer<CustomerState>({},
  on(customerApiActions.listCustomersCompleted, (_state, { customers }) => {
    return {
      ..._state,
      customerList: customers.map(c => ({
        ...c,
        searchTerms: toSearchTerms(c.name),
      })),
    };
  }),
  on(customerApiActions.createCustomerCompleted, (_state, { customerId, name, description, isGroup, rating }) => {
    return {
      ..._state,
      customerList: _state.customerList.concat({
        customerId,
        name,
        searchTerms: toSearchTerms(name),
        description,
        isGroup,
        rating,
        isArchived: false,
        jobs: [],
        blacklistedCustomers: [],
      })
        .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
    };
  }),

  on(customerApiActions.updateCustomerCompleted, (_state, { customerId, name, description, isGroup, rating }) => {   
    return {
      ..._state,
      customerList: _state.customerList.map((c) => {
        if (c.customerId !== customerId) {
          return c;
        }
        return {
          ...c,
          name,
          searchTerms: toSearchTerms(name),
          description,
          isGroup,
          rating,
        };
      }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      })),
    };
  }),
    
  on(customerApiActions.deleteCustomerCompleted, (_state, { customerId }) => {
    return {
      ..._state,
      customerList: _state.customerList.map((c) => {
        if (c.customerId === customerId) {
          return {
            ...c,
            isArchived: true,
          };
        }

        if (c.blacklistedCustomers.some(bc => bc.customerId === customerId)) {
          return {
            ...c,
            blacklistedCustomers: c.blacklistedCustomers.filter(bc => bc.customerId !== customerId),
          };
        }
        
        return c;
      }),
    };
  }),

  on(customerApiActions.createCustomerJobCompleted, (_state, { customerId, duration, name, prices, description, priceList }) => {
    return {
      ..._state,
      customerList: _state.customerList.map((c) => {
        if (c.customerId !== customerId) {
          return c;
        }

        return {
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
      }),
    };
  }),

  on(customerApiActions.updateCustomerJobCompleted, (_state, { customerId, jobName, description, duration, name, prices, priceList }) => {
    return {
      ..._state,
      customerList: _state.customerList.map((c) => {
        if (c.customerId !== customerId) {
          return c;
        }

        return {
          ...c,
          jobs: c.jobs.map((j) => {
            if (j.name !== jobName) {
              return j;
            }

            return {
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
      }),
    };
  }),

  on(customerApiActions.deleteCustomerJobCompleted, (_state, { customerId, jobName }) => {   
    return {
      ..._state,
      customerList: _state.customerList.map(c => {
        if (c.customerId !== customerId) {
          return c;
        }
      
        return {
          ...c,
          jobs: c.jobs.filter(j => j.name !== jobName),
        };
      }),
    };
  }),

  on(customerApiActions.addCustomerToBlacklistCompleted, (_state, { customers: [
    customerA,
    customerB,
  ] }) => {
    return {
      ..._state,
      customerList: _state.customerList.map((customer) => {
        if (customer.customerId === customerA.customerId) {
          return {
            ...customer, 
            blacklistedCustomers: [
              ...customer.blacklistedCustomers,
              customerB,
            ],
          };
        }

        if (customer.customerId === customerB.customerId) {
          return {
            ...customer, 
            blacklistedCustomers: [
              ...customer.blacklistedCustomers,
              customerA,
            ],
          };
        }

        return customer;
      }),
    };
  }),

  on(customerApiActions.deleteCustomerFromBlacklistCompleted, (_state, { customerIds: [
    customerIdA,
    customerIdB,
  ] }) => {
    return {
      ..._state,
      customerList: _state.customerList.map((customer) => {
        if (customer.customerId === customerIdA) {
          return {
            ...customer, 
            blacklistedCustomers: customer.blacklistedCustomers.filter(({ customerId }) => customerId !== customerIdB),
          };  
        }

        if (customer.customerId === customerIdB) {
          return {
            ...customer, 
            blacklistedCustomers: customer.blacklistedCustomers.filter(({ customerId }) => customerId !== customerIdA),
          };  
        }

        return customer;
      }),
    };
  }),

  on(customerApiActions.listCustomerWorksCompleted, (_state, { works, customerId }) => {
    return {
      ..._state,
      customerWorks: {
        ..._state.customerWorks,
        [customerId]: works,
      },
    };
  }),
);
