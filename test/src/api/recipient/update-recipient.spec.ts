import { getRecipientId } from '@household/shared/common/utils';
import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';

describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  let request: Recipient.Request;
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    request = recipientDataFactory.request();

    recipientDocument = recipientDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateRecipient(recipientDataFactory.id(), request)
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
            .requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
              name: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different recipient', () => {
          const updatedRecipientDocument = recipientDataFactory.document(request);

          cy.saveRecipientDocument(recipientDocument)
            .saveRecipientDocument(updatedRecipientDocument)
            .authenticate(1)
            .requestUpdateRecipient(getRecipientId(recipientDocument), request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate recipient name');
        });
      });

      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(recipientDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate(1)
            .requestUpdateRecipient(recipientDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });
});
