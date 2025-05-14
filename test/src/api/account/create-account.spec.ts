import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { UserType } from '@household/shared/enums';

describe('POST account/v1/accounts', () => {
  let request: Account.Request;

  beforeEach(() => {
    request = accountDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateAccount(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should create account', () => {
      cy.authenticate(UserType.Editor)
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
        .authenticate(UserType.Editor)
        .requestCreateAccount(request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              name: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different account of the same owner', () => {
          const accountDocument = accountDataFactory.document(request);

          cy.saveAccountDocument(accountDocument)
            .authenticate(UserType.Editor)
            .requestCreateAccount(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate account name');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              accountType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              accountType: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              accountType: 'not-account-type' as any,
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              currency: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              currency: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              currency: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if owner', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              owner: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('owner', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateAccount(accountDataFactory.request({
              owner: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('owner', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
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
