import { Recipient } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { getRecipientId } from '@household/shared/common/utils';

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

const validateRecipientDocument = (response: Recipient.RecipientId, request: Recipient.Request) => {
  const id = response?.recipientId;

  cy.log('Get recipient document', id)
    .getRecipientDocumentById(id)
    .should((document) => {
      expect(getRecipientId(document), '_id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
    });
};

const validateRecipientResponse = (response: Recipient.Response, document: Recipient.Document) => {
  expect(response.recipientId, 'recipientId').to.equal(getRecipientId(document));
  expect(response.name, 'name').to.equal(document.name);
};

const validateRecipientListResponse = (responses: Recipient.Response[], documents: Recipient.Document[]) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.recipientId === getRecipientId(document));
    validateRecipientResponse(response, document);
  });
};

const validateRecipientDeleted = (recipientId: Recipient.Id) => {
  cy.log('Get recipient document', recipientId)
    .getRecipientDocumentById(recipientId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const saveRecipientDocument = (...params: Parameters<IRecipientService['saveRecipient']>) => {
  return cy.task('saveRecipient', ...params);
};

const getRecipientDocumentById = (...params: Parameters<IRecipientService['getRecipientById']>) => {
  return cy.task<Recipient.Document>('getRecipientById', ...params);
};

export const setRecipientCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateRecipient,
    requestUpdateRecipient,
    requestDeleteRecipient,
    requestGetRecipient,
    requestGetRecipientList,
    requestMergeRecipients,
    validateRecipientDocument,
    validateRecipientResponse,
    validateRecipientListResponse,
  });

  Cypress.Commands.addAll({
    saveRecipientDocument,
    getRecipientDocumentById,
    validateRecipientDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRecipientDeleted: CommandFunction<typeof validateRecipientDeleted>;
      saveRecipientDocument: CommandFunction<typeof saveRecipientDocument>;
      getRecipientDocumentById: CommandFunction<typeof getRecipientDocumentById>
    }

    interface ChainableRequest extends Chainable {
      requestCreateRecipient: CommandFunctionWithPreviousSubject<typeof requestCreateRecipient>;
      requestGetRecipient: CommandFunctionWithPreviousSubject<typeof requestGetRecipient>;
      requestUpdateRecipient: CommandFunctionWithPreviousSubject<typeof requestUpdateRecipient>;
      requestDeleteRecipient: CommandFunctionWithPreviousSubject<typeof requestDeleteRecipient>;
      requestGetRecipientList: CommandFunctionWithPreviousSubject<typeof requestGetRecipientList>;
      requestMergeRecipients: CommandFunctionWithPreviousSubject<typeof requestMergeRecipients>;
    }

    interface ChainableResponseBody extends Chainable {
      validateRecipientDocument: CommandFunctionWithPreviousSubject<typeof validateRecipientDocument>;
      validateRecipientResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientResponse>;
      validateRecipientListResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientListResponse>;
    }
  }
}
