import { createAccountId } from '@household/shared/common/test-data-factory';
import { getAccountId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('PUT /account/v1/accounts/{accountId}', () => {
  let request: Account.Request;
  let accountDocument: Account.Document;

  beforeEach(() => {
    request = {
      name: `new name-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
    };

    accountDocument = accountDocumentConverter.create({
      name: `old name-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateAccount(createAccountId(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update account', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate(1)
        .requestUpdateAccount(getAccountId(accountDocument), request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different account', () => {
          const duplicateAccountDocument = accountDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

          cy.saveAccountDocument(accountDocument)
            .saveAccountDocument(duplicateAccountDocument)
            .authenticate(1)
            .requestUpdateAccount(getAccountId(accountDocument), request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate account name');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              accountType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              accountType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
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
            .requestUpdateAccount(createAccountId(), {
              ...request,
              currency: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              currency: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), {
              ...request,
              currency: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });

        it('does not belong to any account', () => {
          cy.authenticate(1)
            .requestUpdateAccount(createAccountId(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
