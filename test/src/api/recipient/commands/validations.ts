import { Recipient } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getRecipientId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateRecipientDocument = (response: Recipient.RecipientId, request: Recipient.Request) => {
  const id = response?.recipientId;

  cy.log('Get recipient document', id)
    .getRecipientDocumentById(id)
    .should((document) => {
      expect(getRecipientId(document), '_id').to.equal(id);
      const { name, ...internal } = document;

      expect(name, 'name').to.equal(request.name);
      expectRemainingProperties(internal);
    });
};

const validateRecipientResponse = (response: Recipient.Response, document: Recipient.Document) => {
  const { recipientId, name, ...rest } = response;

  expect(recipientId, 'recipientId').to.equal(getRecipientId(document));
  expect(name, 'name').to.equal(document.name);
  expectEmptyObject(rest);
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

export const setRecipientValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateRecipientDocument,
    validateRecipientResponse,
    validateRecipientListResponse,
  });

  Cypress.Commands.addAll({
    validateRecipientDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRecipientDeleted: CommandFunction<typeof validateRecipientDeleted>;
    }

    interface ChainableResponseBody extends Chainable {
      validateRecipientDocument: CommandFunctionWithPreviousSubject<typeof validateRecipientDocument>;
      validateRecipientResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientResponse>;
      validateRecipientListResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientListResponse>;
    }
  }
}
