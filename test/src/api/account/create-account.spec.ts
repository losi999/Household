import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST account/v1/accounts', () => {
  let request: Account.Request;

  beforeEach(() => {
    request = {
      name: `name-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
      owner: 'owner1',
    };
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
      const accountDocument = accountDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

      const modifiedRequest = {
        ...request,
        owner: 'different owner',
      };

      cy.saveAccountDocument(accountDocument)
        .authenticate(1)
        .requestCreateAccount(modifiedRequest)
        .expectCreatedResponse()
        .validateAccountDocument(modifiedRequest);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different account of the same owner', () => {
          const accountDocument = accountDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

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
            .requestCreateAccount({
              ...request,
              accountType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              accountType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              accountType: 'not-account-type' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              currency: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              currency: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              currency: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if owner', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              owner: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('owner', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              owner: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('owner', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateAccount({
              ...request,
              owner: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('owner', 1, 'body');
        });
      });
    });
  });
});
