import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /account/v1/accounts/{accountId}', () => {
  const account: Account.Request = {
    name: 'account',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteAccount(new Types.ObjectId().toString() as Account.IdType)
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

      it('should delete account', () => {
        cy .authenticate('admin1')
          .requestDeleteAccount(accountDocument._id.toString() as Account.IdType)
          .expectNoContentResponse()
          .validateAccountDeleted(accountDocument._id.toString() as Account.IdType);
      });

      describe('related payment transactions', () => {

        beforeEach(() => {
        });
        it.skip('should be deleted if account is deleted', () => {
        });
      });

      describe('related split transactions', () => {

        beforeEach(() => {
        });
        it.skip('should be deleted if account is deleted', () => {
        });
      });

      describe('related transfer transactions', () => {

        beforeEach(() => {
        });
        it.skip('should be deleted if account is deleted', () => {
        });
      });

    });

    describe('should return error', () => {
      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteAccount(`${new Types.ObjectId()}-not-valid` as Account.IdType)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
