import { createTransactionId } from '@household/shared/common/test-data-factory';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('DELETE /transaction/v1/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: `account-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
      owner: 'owner1',
    }, Cypress.env('EXPIRES_IN'), true);

    transferAccountDocument = accountDocumentConverter.create({
      name: `account2-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
      owner: 'owner1',
    }, Cypress.env('EXPIRES_IN'), true);

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        issuedAt: new Date().toISOString(),
        categoryId: undefined,
        description: 'payment',
        inventory: undefined,
        invoice: undefined,
        projectId: undefined,
        recipientId: undefined,
      },
      account: accountDocument,
      category: undefined,
      recipient: undefined,
      project: undefined,
      product: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        issuedAt: new Date().toISOString(),
        description: 'split',
        recipientId: undefined,
        splits: [
          {
            amount: 100,
            description: 'split',
            categoryId: undefined,
            inventory: undefined,
            invoice: undefined,
            projectId: undefined,
          },
        ],
      },
      account: accountDocument,
      categories: {},
      recipient: undefined,
      projects: {},
      products: {},
    }, Cypress.env('EXPIRES_IN'), true);

    transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        transferAmount: -10,
        transferAccountId: getAccountId(transferAccountDocument),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: accountDocument,
      transferAccount: transferAccountDocument,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteTransaction(createTransactionId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete payment transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(paymentTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(paymentTransactionDocument));
    });

    it('should delete split transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(splitTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(splitTransactionDocument));
    });

    it('should delete transfer transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(transferTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(transferTransactionDocument));
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteTransaction(createTransactionId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });
      });
    });
  });
});
