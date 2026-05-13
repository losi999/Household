import { customerApiEvents } from '@hairdressing/state/customer/customer-events';
import { CustomerState } from '@hairdressing/state/customer/customer-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withCustomerReducer = () => {
  return signalStoreFeature(
    withReducer<CustomerState>(
      on(customerApiEvents.listCustomersCompleted, ({ payload }) => {
        return {
          customerList: payload.map(c => {
            return {
              ...c,
              searchTerms: toSearchTerms(c.name),
            };
          }),
        };
      }),
      on(customerApiEvents.createCustomerCompleted, ({ payload: { customerId, description, name, isGroup, rating } }) => {
        return (state) => {
          return {
            customerList: state.customerList.concat({
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
        };
      }),
      on(customerApiEvents.updateCustomerCompleted, ({ payload: { customerId, description, name, isGroup, rating } }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((c) => {
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
        };
      }),
      on(customerApiEvents.updateCustomerInitiated, customerApiEvents.deleteCustomerInitiated, ({ payload: { customerId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.concat(customerId),
          };
        };
      }),
      on(customerApiEvents.updateCustomerCompleted, customerApiEvents.deleteCustomerCompleted, customerApiEvents.updateCustomerFailed, customerApiEvents.deleteCustomerFailed, ({ payload: { customerId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== customerId),
          };
        };
      }),
      on(customerApiEvents.deleteCustomerCompleted, ({ payload: { customerId } }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((c) => {
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
        };
      }),
      on(customerApiEvents.createCustomerJobCompleted, ({ payload: { customerId, duration, name, prices, description, additionalPrice, priceList } }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((c) => {
              if (c.customerId !== customerId) {
                return c;
              }

              return {
                ...c,
                jobs: c.jobs.concat({
                  name,
                  prices: prices.map((p) => {
                    const price = priceList.find(x => x.priceId === p.priceId);
                    return {
                      ...price,
                      quantity: p.quantity,
                    };
                  }),
                  duration,
                  description,
                  additionalPrice,
                })
                  .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                    sensitivity: 'base',
                  })),
              };
            }),
          };
        };
      }),
      on(customerApiEvents.updateCustomerJobCompleted, ({ payload: { customerId, jobName, description, duration, name, additionalPrice, prices, priceList } }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((c) => {
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
                      const price = priceList.find(x => x.priceId === p.priceId);
                      return {
                        ...price,
                        quantity: p.quantity,
                      };
                    }),
                    duration,
                    description,
                    additionalPrice,
                  };
                }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                  sensitivity: 'base',
                })),
              };
            }),
          };
        };
      }),
      on(customerApiEvents.deleteCustomerJobCompleted, ({ payload: { customerId, jobName } }) => {
        return (state) => {
          return {
            customerList: state.customerList.map(c => {
              if (c.customerId !== customerId) {
                return c;
              }
      
              return {
                ...c,
                jobs: c.jobs.filter(j => j.name !== jobName),
              };
            }),
          };
        };
      }),
      on(customerApiEvents.addCustomerToBlacklistCompleted, ({ payload: [
        customerA,
        customerB,
      ] }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((customer) => {
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
        };
      }),
      on(customerApiEvents.deleteCustomerFromBlacklistCompleted, ({ payload: [
        customerIdA,
        customerIdB,
      ] }) => {
        return (state) => {
          return {
            customerList: state.customerList.map((customer) => {
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
        };
      }),
      on(customerApiEvents.listCustomerWorksCompleted, ({ payload: { works, customerId } }) => {
        return (state) => {
          return {
            customerWorks: {
              ...state.customerWorks,
              [customerId]: works,
            },
          };
        };
      }),
    ),
  );
};
