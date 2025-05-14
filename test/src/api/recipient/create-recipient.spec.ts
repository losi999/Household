import { Recipient } from '@household/shared/types/types';
import { recipientDataFactory } from './data-factory';

describe('POST recipient/v1/recipients', () => {
  let request: Recipient.Request;

  beforeEach(() => {
    request = recipientDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateRecipient(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should create recipient', () => {
      cy.authenticate('admin')
        .requestCreateRecipient(request)
        .expectCreatedResponse()
        .validateRecipientDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin')
            .requestCreateRecipient(recipientDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin')
            .requestCreateRecipient(recipientDataFactory.request({
              name: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin')
            .requestCreateRecipient(recipientDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different recipient', () => {
          const recipientDocument = recipientDataFactory.document(request);

          cy.saveRecipientDocument(recipientDocument)
            .authenticate('admin')
            .requestCreateRecipient(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate recipient name');
        });
      });
    });
  });
});
