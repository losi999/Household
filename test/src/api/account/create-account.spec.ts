import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';

describe('POST account/v1/accounts', () => {
  let request: Account.Request;

  beforeEach(() => {
    request = accountDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateAccount(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should create account', () => {
      cy.authenticate(1)
        .requestCreateAccount(request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });

    it('should create account with an existing name for a different owner', () => {
      const accountDocument = accountDataFactory.document(request);

      request = accountDataFactory.request({
        name: request.name,
      });

      cy.saveAccountDocument(accountDocument)
        .authenticate(1)
        .requestCreateAccount(request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              name: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different account of the same owner', () => {
          const accountDocument = accountDataFactory.document(request);

          cy.saveAccountDocument(accountDocument)
            .authenticate(1)
            .requestCreateAccount(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate account name');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              accountType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              accountType: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              accountType: 'not-account-type',
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              currency: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              currency: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              currency: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if owner', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              owner: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('owner', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              owner: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('owner', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount(accountDataFactory.request({
              owner: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('owner', 1, 'body');
        });
      });
    });
  });
});
