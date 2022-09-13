import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /account/v1/accounts/{accountId}', () => {
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

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteAccount(createAccountId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should delete account', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate('admin1')
        .requestDeleteAccount(createAccountId(accountDocument._id))
        .expectNoContentResponse()
        .validateAccountDeleted(createAccountId(accountDocument._id));
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

    describe('should return error', () => {
      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteAccount(createAccountId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
