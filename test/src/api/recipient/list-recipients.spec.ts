import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as schema } from '@household/test/api/schemas/recipient-response-list';
import { Recipient } from '@household/shared/types/types';

describe('GET /recipient/v1/recipients', () => {
  let recipientDocument1: Recipient.Document;
  let recipientDocument2: Recipient.Document;

  beforeEach(() => {
    recipientDocument1 = recipientDocumentConverter.create({
      name: 'recipient 1',
    }, Cypress.env('EXPIRES_IN'), true);
    recipientDocument2 = recipientDocumentConverter.create({
      name: 'recipient 2',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipientList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of recipients', () => {
      cy.saveRecipientDocument(recipientDocument1)
        .saveRecipientDocument(recipientDocument2)
        .authenticate(1)
        .requestGetRecipientList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateRecipientListResponse([
          recipientDocument1,
          recipientDocument2,
        ]);
    });
  });
});
