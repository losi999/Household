import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from './data-factory';

describe('POST recipient/v1/recipients', () => {
  let request: Recipient.Request;

  beforeEach(() => {
    request = recipientDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateRecipient(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should create recipient', () => {
      cy.authenticate(1)
        .requestCreateRecipient(request)
        .expectCreatedResponse()
        .validateRecipientDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateRecipient(recipientDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateRecipient(recipientDataFactory.request({
              name: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateRecipient(recipientDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different recipient', () => {
          const recipientDocument = recipientDataFactory.document(request);

          cy.saveRecipientDocument(recipientDocument)
            .authenticate(1)
            .requestCreateRecipient(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate recipient name');
        });
      });
    });
  });
});
