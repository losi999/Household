import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as schema } from '@household/test/api/schemas/account-response';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { createAccountId } from '@household/shared/common/test-data-factory';

describe('GET /account/v1/accounts/{accountId}', () => {
  const account: Account.Request = {
    name: 'account',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  let accountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create(account, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();
  });

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccount(createAccountId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get account by id', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate('admin1')
        .requestGetAccount(createAccountId(accountDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountResponse(accountDocument, 0);
    });

    describe('should return error if accountId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetAccount(createAccountId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('accountId', 'pathParameters');
      });

      it('does not belong to any account', () => {
        cy.authenticate('admin1')
          .requestGetAccount(createAccountId())
          .expectNotFoundResponse();
      });
    });
  });
});
