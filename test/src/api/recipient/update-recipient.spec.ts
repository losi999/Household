import { createRecipientId } from '@household/shared/common/test-data-factory';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'old name',
  };

  const recipientToUpdate: Recipient.Request = {
    name: 'new name',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateRecipient(createRecipientId(), recipientToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a recipient', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate('admin1')
        .requestUpdateRecipient(createRecipientId(recipientDocument._id), recipientToUpdate)
        .expectCreatedResponse()
        .validateRecipientDocument(recipientToUpdate);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(createRecipientId(), {
              ...recipient,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(createRecipientId(), {
              ...recipient,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(createRecipientId(), {
              ...recipient,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(createRecipientId('not-valid'), recipientToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate('admin1')
            .requestUpdateRecipient(createRecipientId(), recipientToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });
});
