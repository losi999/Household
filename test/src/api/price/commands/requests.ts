import { Price } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreatePrice = (idToken: string, price: Price.Request) => {
  return cy.request({
    body: price,
    method: 'POST',
    url: '/price/v1/prices',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdatePrice = (idToken: string, priceId: Price.Id, price: Price.Request) => {
  return cy.request({
    body: price,
    method: 'PUT',
    url: `/price/v1/prices/${priceId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeletePrice = (idToken: string, priceId: Price.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/price/v1/prices/${priceId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetPriceList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/price/v1/prices',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setPriceRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreatePrice,
    requestUpdatePrice,
    requestDeletePrice,
    requestGetPriceList,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreatePrice: CommandFunctionWithPreviousSubject<typeof requestCreatePrice>;
      requestUpdatePrice: CommandFunctionWithPreviousSubject<typeof requestUpdatePrice>;
      requestDeletePrice: CommandFunctionWithPreviousSubject<typeof requestDeletePrice>;
      requestGetPriceList: CommandFunctionWithPreviousSubject<typeof requestGetPriceList>;
    }
  }
}
