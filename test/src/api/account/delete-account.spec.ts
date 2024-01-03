import { createAccountId } from '@household/shared/common/test-data-factory';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('DELETE /account/v1/accounts/{accountId}', () => {
  let accountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: `account-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
      owner: 'owner1',
    }, Cypress.env('EXPIRES_IN'), true);
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
        .requestDeleteAccount(getAccountId(accountDocument))
        .expectNoContentResponse()
        .validateAccountDeleted(getAccountId(accountDocument));
    });

    describe('related transactions', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let transferTransactionDocument: Transaction.TransferDocument;
      let invertedTransferTransactionDocument: Transaction.TransferDocument;
      let transferAccountDocument: Account.Document;

      beforeEach(() => {
        transferAccountDocument = accountDocumentConverter.create({
          name: `transfer-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
          owner: 'owner1',
        }, Cypress.env('EXPIRES_IN'), true);

        paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
          body: {
            accountId: getAccountId(accountDocument),
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
          product: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
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
          categories: {},
          projects: {},
          products: {},
        }, Cypress.env('EXPIRES_IN'), true);

        transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 100,
            transferAmount: -10,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            transferAccountId: getAccountId(transferAccountDocument),
          },
          account: accountDocument,
          transferAccount: transferAccountDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        invertedTransferTransactionDocument = transactionDocumentConverter.createTransferDocument({
          body: {
            accountId: getAccountId(transferAccountDocument),
            amount: 100,
            transferAmount: -10,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            transferAccountId: getAccountId(accountDocument),
          },
          account: transferAccountDocument,
          transferAccount: accountDocument,
        }, Cypress.env('EXPIRES_IN'), true);
      });
      it('should be deleted if account is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .saveTransactionDocument(transferTransactionDocument)
          .saveTransactionDocument(invertedTransferTransactionDocument)
          .authenticate(1)
          .requestDeleteAccount(getAccountId(accountDocument))
          .expectNoContentResponse()
          .validateAccountDeleted(getAccountId(accountDocument))
          .validateTransactionDeleted(getTransactionId(paymentTransactionDocument))
          .validateTransactionDeleted(getTransactionId(splitTransactionDocument))
          .validateTransactionDeleted(getTransactionId(transferTransactionDocument))
          .validateTransactionDeleted(getTransactionId(invertedTransferTransactionDocument));
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
