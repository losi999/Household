import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getRecipientId } from '@household/shared/common/utils';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';

describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  const request: Recipient.Request = {
    name: 'new name',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create({
      name: 'old name',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateRecipient(createRecipientId(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a recipient', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate(1)
        .requestUpdateRecipient(getRecipientId(recipientDocument), request)
        .expectCreatedResponse()
        .validateRecipientDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), {
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), {
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), {
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(createRecipientId(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });
});
