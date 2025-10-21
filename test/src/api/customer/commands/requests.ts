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

const requestListCustomerWorks = (idToken: string, customerId: Customer.Id) => {
  return cy.request({
    method: 'GET',
    url: `/customer/v1/customers/${customerId}/works`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestCreateCustomerJob = (idToken: string, customerId: Customer.Id, job: Customer.Job.Request) => {
  return cy.request({
    body: job,
    method: 'POST',
    url: `/customer/v1/customers/${customerId}/jobs`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateCustomerJob = (idToken: string, customerId: Customer.Id, jobName: Customer.Job.Name['name'], job: Customer.Job.Request) => {
  return cy.request({
    body: job,
    method: 'PUT',
    url: `/customer/v1/customers/${customerId}/jobs/${jobName}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteCustomerJob = (idToken: string, customerId: Customer.Id, jobName: Customer.Job.Name['name']) => {
  return cy.request({
    method: 'DELETE',
    url: `/customer/v1/customers/${customerId}/jobs/${jobName}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestAddCustomerToBlacklist = (idToken: string, body: Customer.Id[]) => {
  return cy.request({
    body,
    method: 'PUT',
    url: '/customer/v1/customers/blacklist',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestRemoveCustomerFromBlacklist = (idToken: string, body: Customer.Id[]) => {
  return cy.request({
    body,
    method: 'DELETE',
    url: '/customer/v1/customers/blacklist',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
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
    requestGetCustomer,
    requestGetCustomerList,
    requestCreateCustomerJob,
    requestUpdateCustomerJob,
    requestAddCustomerToBlacklist,
    requestRemoveCustomerFromBlacklist,
    requestDeleteCustomerJob,
    requestListCustomerWorks,
  });
};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateCustomer: CommandFunctionWithPreviousSubject<typeof requestCreateCustomer>;
      requestGetCustomer: CommandFunctionWithPreviousSubject<typeof requestGetCustomer>;
      requestListCustomerWorks: CommandFunctionWithPreviousSubject<typeof requestListCustomerWorks>;
      requestUpdateCustomer: CommandFunctionWithPreviousSubject<typeof requestUpdateCustomer>;
      requestGetCustomerList: CommandFunctionWithPreviousSubject<typeof requestGetCustomerList>;
      requestCreateCustomerJob: CommandFunctionWithPreviousSubject<typeof requestCreateCustomerJob>;
      requestUpdateCustomerJob: CommandFunctionWithPreviousSubject<typeof requestUpdateCustomerJob>;
      requestDeleteCustomerJob: CommandFunctionWithPreviousSubject<typeof requestDeleteCustomerJob>;
      requestAddCustomerToBlacklist: CommandFunctionWithPreviousSubject<typeof requestAddCustomerToBlacklist>;
      requestRemoveCustomerFromBlacklist: CommandFunctionWithPreviousSubject<typeof requestRemoveCustomerFromBlacklist>;
    }
  }
}
