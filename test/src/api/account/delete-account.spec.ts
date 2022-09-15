import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteAccount(createAccountId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should delete account', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate(1)
        .requestDeleteAccount(createAccountId(accountDocument._id))
        .expectNoContentResponse()
        .validateAccountDeleted(createAccountId(accountDocument._id));
    });

    describe('related transactions', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let transferTransactionDocument: Transaction.TransferDocument;
      let invertedTransferTransactionDocument: Transaction.TransferDocument;
      let transferAccountDocument: Account.Document;

      beforeEach(() => {
        transferAccountDocument = accountDocumentConverter.create({
          ...account,
          name: 'transfer',
        }, Cypress.env('EXPIRES_IN'));
        transferAccountDocument._id = new Types.ObjectId();

        paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            categoryId: undefined,
            inventory: undefined,
            invoice: undefined,
            projectId: undefined,
            recipientId: undefined,
          },
          account: accountDocument,
          category: undefined,
          project: undefined,
          recipient: undefined,
        }, Cypress.env('EXPIRES_IN'));
        paymentTransactionDocument._id = new Types.ObjectId();

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            recipientId: undefined,
            splits: [
              {
                amount: 100,
                categoryId: undefined,
                description: undefined,
                inventory: undefined,
                invoice: undefined,
                projectId: undefined,
              },
            ],
          },
          account: accountDocument,
          recipient: undefined,
          categories: [],
          projects: [],
        }, Cypress.env('EXPIRES_IN'));
        splitTransactionDocument._id = new Types.ObjectId();

        transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            transferAccountId: createAccountId(transferAccountDocument._id),
          },
          account: accountDocument,
          transferAccount: transferAccountDocument,
        }, Cypress.env('EXPIRES_IN'));
        transferTransactionDocument._id = new Types.ObjectId();

        invertedTransferTransactionDocument = transactionDocumentConverter.createTransferDocument({
          body: {
            accountId: createAccountId(transferAccountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            transferAccountId: createAccountId(accountDocument._id),
          },
          account: transferAccountDocument,
          transferAccount: accountDocument,
        }, Cypress.env('EXPIRES_IN'));
        invertedTransferTransactionDocument._id = new Types.ObjectId();
      });
      it('should be deleted if account is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .saveTransactionDocument(transferTransactionDocument)
          .saveTransactionDocument(invertedTransferTransactionDocument)
          .authenticate(1)
          .requestDeleteAccount(createAccountId(accountDocument._id))
          .expectNoContentResponse()
          .validateAccountDeleted(createAccountId(accountDocument._id))
          .validateTransactionDeleted(createTransactionId(paymentTransactionDocument._id))
          .validateTransactionDeleted(createTransactionId(splitTransactionDocument._id))
          .validateTransactionDeleted(createTransactionId(transferTransactionDocument._id))
          .validateTransactionDeleted(createTransactionId(invertedTransferTransactionDocument._id));
      });
    });

    describe('should return error', () => {
      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteAccount(createAccountId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
