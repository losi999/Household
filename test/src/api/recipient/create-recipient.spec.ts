import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { Recipient } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST recipient/v1/recipients', () => {
  let request: Recipient.Request;

  beforeEach(() => {
    request = {
      name: `name-${uuid()}`,
    };
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
            .requestCreateRecipient({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateRecipient({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateRecipient({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different recipient', () => {
          const recipientDocument = recipientDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

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
