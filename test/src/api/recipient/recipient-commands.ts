import { Recipient } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IRecipientService } from '@household/shared/services/recipient-service';

const recipientTask = <T extends keyof IRecipientService>(name: T, params: Parameters<IRecipientService[T]>) => {
  return cy.task(name, ...params);
};

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

const requestUpdateRecipient = (idToken: string, recipientId: Recipient.IdType, recipient: Recipient.Request) => {
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

const requestDeleteRecipient = (idToken: string, recipientId: Recipient.IdType) => {
  return cy.request({
    method: 'DELETE',
    url: `/recipient/v1/recipients/${recipientId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetRecipient = (idToken: string, recipientId: Recipient.IdType) => {
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

const validateRecipientDocument = (response: Recipient.Id, request: Recipient.Request) => {
  const id = response?.recipientId;

  cy.log('Get recipient document', id)
    .recipientTask('getRecipientById', [id])
    .should((document: Recipient.Document) => {
      expect(document._id.toString()).to.equal(id);
      expect(document.name).to.equal(request.name);
    });
};

const validateRecipientResponse = (response: Recipient.Response, document: Recipient.Document) => {
  expect(response.recipientId).to.equal(document._id.toString());
  expect(response.name).to.equal(document.name);
};

const validateRecipientDeleted = (recipientId: Recipient.IdType) => {
  cy.log('Get recipient document', recipientId)
    .recipientTask('getRecipientById', [recipientId])
    .should((document) => {
      expect(document).to.be.null;
    });
};

export const setRecipientCommands = () => {
  Cypress.Commands.addAll<any, string>({
    prevSubject: true,
  }, {
    requestCreateRecipient,
    requestUpdateRecipient,
    requestDeleteRecipient,
    requestGetRecipient,
    requestGetRecipientList,
  });

  Cypress.Commands.addAll({
    prevSubject: true,
  }, {
    validateRecipientDocument,
    validateRecipientResponse,
  });

  Cypress.Commands.addAll({
    recipientTask,
    validateRecipientDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRecipientDeleted: CommandFunction<typeof validateRecipientDeleted>;
      recipientTask: CommandFunction<typeof recipientTask>
    }

    interface ChainableRequest extends Chainable {
      requestCreateRecipient: CommandFunctionWithPreviousSubject<typeof requestCreateRecipient>;
      requestGetRecipient: CommandFunctionWithPreviousSubject<typeof requestGetRecipient>;
      requestUpdateRecipient: CommandFunctionWithPreviousSubject<typeof requestUpdateRecipient>;
      requestDeleteRecipient: CommandFunctionWithPreviousSubject<typeof requestDeleteRecipient>;
      requestGetRecipientList: CommandFunctionWithPreviousSubject<typeof requestGetRecipientList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateRecipientDocument: CommandFunctionWithPreviousSubject<typeof validateRecipientDocument>;
      validateRecipientResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientResponse>;
    }
  }
}
