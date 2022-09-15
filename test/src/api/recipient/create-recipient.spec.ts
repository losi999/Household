import { Recipient } from '@household/shared/types/types';

describe('POST recipient/v1/recipients', () => {
  const request: Recipient.Request = {
    name: 'name',
  };

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateRecipient(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it.only('should create recipient', () => {
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
      });
    });
  });
});
