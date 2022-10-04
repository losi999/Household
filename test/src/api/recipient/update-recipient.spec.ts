import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getRecipientId } from '@household/shared/common/utils';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';

describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'old name',
  };

  const recipientToUpdate: Recipient.Request = {
    name: 'new name',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateRecipient(createRecipientId(), recipientToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a recipient', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate(1)
        .requestUpdateRecipient(getRecipientId(recipientDocument), recipientToUpdate)
        .expectCreatedResponse()
        .validateRecipientDocument(recipientToUpdate);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), {
              ...recipient,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), {
              ...recipient,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
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
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId('not-valid'), recipientToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), recipientToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });
});
