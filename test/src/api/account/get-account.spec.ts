import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as schema } from '@household/test/api/schemas/account-response';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('GET /account/v1/accounts/{accountId}', () => {
  const account: Account.Request = {
    name: 'account',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccount(new Types.ObjectId().toString() as Account.IdType)
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

      it('should get account by id', () => {
        cy.authenticate('admin1')
          .requestGetAccount(accountDocument._id.toString() as Account.IdType)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateAccountResponse(accountDocument);
      });
    });

    describe('should return error if accountId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetAccount(`${new Types.ObjectId().toString()}-not-valid` as Account.IdType)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('accountId', 'pathParameters');
      });

      it('does not belong to any account', () => {
        cy.authenticate('admin1')
          .requestGetAccount(new Types.ObjectId().toString() as Account.IdType)
          .expectNotFoundResponse();
      });
    });
  });
});
