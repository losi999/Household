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

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, accountToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('with test data created', () => {
      let accountDocument: Account.Document;

      beforeEach(() => {
        cy.accountTask('saveAccount', [accountDocumentConverter.create(account, Cypress.env('EXPIRES_IN'))]).then((document: Account.Document) => {
          accountDocument = document;
        });
      });
      it('should update a account', () => {
        cy
          .authenticate('admin1')
          .requestUpdateAccount(accountDocument._id.toString() as Account.IdType, accountToUpdate)
          .expectCreatedResponse()
          .validateAccountDocument(accountToUpdate);
      });
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
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
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              accountType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              accountType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
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
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              currency: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
              ...account,
              currency: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, {
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
            .requestUpdateAccount(`${new Types.ObjectId().toString()}-not-valid` as Account.IdType, accountToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });

        it('does not belong to any account', () => {
          cy.authenticate('admin1')
            .requestUpdateAccount(new Types.ObjectId().toString() as Account.IdType, accountToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
