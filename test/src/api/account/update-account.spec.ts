import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT /account/v1/accounts/{accountId}', () => {
  const account: Account.Request = {
    name: 'old name',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  const accountToUpdate: Account.Request = {
    name: 'new name',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  let accountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create(account, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateAccount(createAccountId(), accountToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a account', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate('admin1')
        .requestUpdateAccount(createAccountId(accountDocument._id), accountToUpdate)
        .expectCreatedResponse()
        .validateAccountDocument(accountToUpdate);
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              accountType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              accountType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              accountType: 'not-account-type' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              currency: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              currency: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), {
              ...account,
              currency: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId('not-valid'), accountToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });

        it('does not belong to any account', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(createAccountId(), accountToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
