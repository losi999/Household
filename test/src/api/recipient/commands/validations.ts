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

const validateRecipientResponse = (nestedPath: string = '') => (response: Recipient.Response, document: Recipient.Document) => {
  const { recipientId, name, ...empty } = response;

  expect(recipientId, `${nestedPath}recipientId`).to.equal(getRecipientId(document));
  expect(name, `${nestedPath}name`).to.equal(document.name);
  expectEmptyObject(empty, nestedPath);
};

const validateNestedRecipientResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateRecipientResponse>>) => validateRecipientResponse(nestedPath)(...rest);

const validateRecipientListResponse = (responses: Recipient.Response[], documents: Recipient.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.recipientId === getRecipientId(document));
    cy.validateNestedRecipientResponse(`[${index}].`, response, document);
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
    validateRecipientResponse: validateRecipientResponse(),
    validateRecipientListResponse,
  });

  Cypress.Commands.addAll({
    validateRecipientDeleted,
    validateNestedRecipientResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRecipientDeleted: CommandFunction<typeof validateRecipientDeleted>;
      validateNestedRecipientResponse: CommandFunction<typeof validateNestedRecipientResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateRecipientDocument: CommandFunctionWithPreviousSubject<typeof validateRecipientDocument>;
      validateRecipientResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateRecipientResponse>>;
      validateRecipientListResponse: CommandFunctionWithPreviousSubject<typeof validateRecipientListResponse>;
    }
  }
}
