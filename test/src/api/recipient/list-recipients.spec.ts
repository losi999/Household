import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as schema } from '@household/test/api/schemas/recipient-response-list';
import { Recipient } from '@household/shared/types/types';

describe('GET /recipient/v1/recipients', () => {
  const recipient1: Recipient.Request = {
    name: 'recipient 1',
  };

  const recipient2: Recipient.Request = {
    name: 'recipient 2',
  };

  let recipientDocument1: Recipient.Document;
  let recipientDocument2: Recipient.Document;

  beforeEach(() => {
    recipientDocument1 = recipientDocumentConverter.create(recipient1, Cypress.env('EXPIRES_IN'));
    recipientDocument2 = recipientDocumentConverter.create(recipient2, Cypress.env('EXPIRES_IN'));
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipientList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of recipients', () => {
      cy.recipientTask('saveRecipient', [recipientDocument1])
        .recipientTask('saveRecipient', [recipientDocument2])
        .authenticate('admin1')
        .requestGetRecipientList()
        .expectOkResponse()
        .expectValidResponseSchema(schema);
    });
  });
});
