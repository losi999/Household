import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'recipient',
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteRecipient(new Types.ObjectId().toString() as Recipient.IdType)
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

      it('should delete recipient', () => {
        cy .authenticate('admin1')
          .requestDeleteRecipient(recipientDocument._id.toString() as Recipient.IdType)
          .expectNoContentResponse()
          .validateRecipientDeleted(recipientDocument._id.toString() as Recipient.IdType);
      });

      describe('in related transactions recipient', () => {

        beforeEach(() => {
        });
        it.skip('should be unset if recipient is deleted', () => {
        });
      });

    });

    describe('should return error', () => {
      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteRecipient(`${new Types.ObjectId()}-not-valid` as Recipient.IdType)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });
      });
    });
  });
});
