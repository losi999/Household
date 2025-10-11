import { Customer } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateCustomer = (idToken: string, customer: Customer.Request) => {
  return cy.request({
    body: customer,
    method: 'POST',
    url: '/customer/v1/customers',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateCustomer = (idToken: string, customerId: Customer.Id, customer: Customer.Request) => {
  return cy.request({
    body: customer,
    method: 'PUT',
    url: `/customer/v1/customers/${customerId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteCustomer = (idToken: string, customerId: Customer.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/customer/v1/customers/${customerId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCustomer = (idToken: string, customerId: Customer.Id) => {
  return cy.request({
    method: 'GET',
    url: `/customer/v1/customers/${customerId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCustomerList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/customer/v1/customers',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setCustomerRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateCustomer,
    requestUpdateCustomer,
    requestDeleteCustomer,
    requestGetCustomer,
    requestGetCustomerList,
  });
};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateCustomer: CommandFunctionWithPreviousSubject<typeof requestCreateCustomer>;
      requestGetCustomer: CommandFunctionWithPreviousSubject<typeof requestGetCustomer>;
      requestUpdateCustomer: CommandFunctionWithPreviousSubject<typeof requestUpdateCustomer>;
      requestDeleteCustomer: CommandFunctionWithPreviousSubject<typeof requestDeleteCustomer>;
      requestGetCustomerList: CommandFunctionWithPreviousSubject<typeof requestGetCustomerList>;
    }
  }
}
