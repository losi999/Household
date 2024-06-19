import { default as schema } from '@household/test/api/schemas/recipient-response';
import { Recipient } from '@household/shared/types/types';
import { getRecipientId } from '@household/shared/common/utils';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';

describe('GET /recipient/v1/recipients/{recipientId}', () => {
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipient(recipientDataFactory.id())
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
          .requestGetRecipient(recipientDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('recipientId', 'pathParameters');
      });

      it('does not belong to any recipient', () => {
        cy.authenticate(1)
          .requestGetRecipient(recipientDataFactory.id())
          .expectNotFoundResponse();
      });
    });
  });
});
