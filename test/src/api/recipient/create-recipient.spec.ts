import { Recipient } from '@household/shared/types/types';

describe('POST recipient/v1/recipients', () => {
  const request: Recipient.Request = {
    name: 'name',
  };

  describe('called as an admin', () => {

    it('should create recipient', () => {
      cy.authenticate('admin1')
        .requestCreateRecipient(request)
        .expectCreatedResponse()
        .validateRecipientDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateRecipient({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateRecipient({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
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
