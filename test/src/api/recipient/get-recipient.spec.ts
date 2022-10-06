import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as schema } from '@household/test/api/schemas/recipient-response';
import { Recipient } from '@household/shared/types/types';
import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getRecipientId } from '@household/shared/common/utils';

describe('GET /recipient/v1/recipients/{recipientId}', () => {
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create({
      name: 'recipient',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipient(createRecipientId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get recipient by id', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate(1)
        .requestGetRecipient(getRecipientId(recipientDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateRecipientResponse(recipientDocument);
    });

    describe('should return error if recipientId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestGetRecipient(createRecipientId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('recipientId', 'pathParameters');
      });

      it('does not belong to any recipient', () => {
        cy.authenticate(1)
          .requestGetRecipient(createRecipientId())
          .expectNotFoundResponse();
      });
    });
  });
});
