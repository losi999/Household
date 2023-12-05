import { Recipient } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateRecipient = (idToken: string, recipient: Recipient.Request) => {
  return cy.request({
    body: recipient,
    method: 'POST',
    url: '/recipient/v1/recipients',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateRecipient = (idToken: string, recipientId: Recipient.Id, recipient: Recipient.Request) => {
  return cy.request({
    body: recipient,
    method: 'PUT',
    url: `/recipient/v1/recipients/${recipientId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteRecipient = (idToken: string, recipientId: Recipient.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/recipient/v1/recipients/${recipientId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetRecipient = (idToken: string, recipientId: Recipient.Id) => {
  return cy.request({
    method: 'GET',
    url: `/recipient/v1/recipients/${recipientId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetRecipientList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/recipient/v1/recipients',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestMergeRecipients = (idToken: string, recipientId: Recipient.Id, sourceRecipientIds: Recipient.Id[]) => {
  return cy.request({
    body: sourceRecipientIds,
    method: 'POST',
    url: `/recipient/v1/recipients/${recipientId}/merge`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setRecipientRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateRecipient,
    requestUpdateRecipient,
    requestDeleteRecipient,
    requestGetRecipient,
    requestGetRecipientList,
    requestMergeRecipients,
  });
};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateRecipient: CommandFunctionWithPreviousSubject<typeof requestCreateRecipient>;
      requestGetRecipient: CommandFunctionWithPreviousSubject<typeof requestGetRecipient>;
      requestUpdateRecipient: CommandFunctionWithPreviousSubject<typeof requestUpdateRecipient>;
      requestDeleteRecipient: CommandFunctionWithPreviousSubject<typeof requestDeleteRecipient>;
      requestGetRecipientList: CommandFunctionWithPreviousSubject<typeof requestGetRecipientList>;
      requestMergeRecipients: CommandFunctionWithPreviousSubject<typeof requestMergeRecipients>;
    }
  }
}
