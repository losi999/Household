import { createRecipientId } from '@household/shared/common/test-data-factory';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'recipient',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteRecipient(createRecipientId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete recipient', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate('admin1')
        .requestDeleteRecipient(createRecipientId(recipientDocument._id))
        .expectNoContentResponse()
        .validateRecipientDeleted(createRecipientId(recipientDocument._id));
    });

    describe('in related transactions recipient', () => {

      beforeEach(() => {
      });
      it.skip('should be unset if recipient is deleted', () => {
      });
    });

    describe('should return error', () => {
      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteRecipient(createRecipientId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });
      });
    });
  });
});
