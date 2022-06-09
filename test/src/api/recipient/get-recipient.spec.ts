import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as schema } from '@household/test/api/schemas/recipient-response';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('GET /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'recipient',
  };

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetRecipient(new Types.ObjectId().toString() as Recipient.IdType)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('with test data created', () => {
      let recipientDocument: Recipient.Document;

      beforeEach(() => {
        cy.recipientTask('saveRecipient', [recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'))]).then((document: Recipient.Document) => {
          recipientDocument = document;
        });
      });

      it('should get recipient by id', () => {
        cy.authenticate('admin1')
          .requestGetRecipient(recipientDocument._id.toString() as Recipient.IdType)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateRecipientResponse(recipientDocument);
      });
    });

    describe('should return error if recipientId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetRecipient(`${new Types.ObjectId().toString()}-not-valid` as Recipient.IdType)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('recipientId', 'pathParameters');
      });

      it('does not belong to any recipient', () => {
        cy.authenticate('admin1')
          .requestGetRecipient(new Types.ObjectId().toString() as Recipient.IdType)
          .expectNotFoundResponse();
      });
    });
  });
});
