import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as schema } from '@household/test/api/schemas/recipient-response';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { createRecipientId } from '@household/shared/common/test-data-factory';

describe('GET /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'recipient',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();
  });

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipient(createRecipientId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get recipient by id', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate('admin1')
        .requestGetRecipient(createRecipientId(recipientDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateRecipientResponse(recipientDocument);
    });

    describe('should return error if recipientId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetRecipient(createRecipientId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('recipientId', 'pathParameters');
      });

      it('does not belong to any recipient', () => {
        cy.authenticate('admin1')
          .requestGetRecipient(createRecipientId())
          .expectNotFoundResponse();
      });
    });
  });
});
