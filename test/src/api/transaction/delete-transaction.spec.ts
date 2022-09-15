import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /transaction/v1/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: 'account',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();

    transferAccountDocument = accountDocumentConverter.create({
      name: 'account2',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    transferAccountDocument._id = new Types.ObjectId();

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
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
    }, Cypress.env('EXPIRES_IN'));
    paymentTransactionDocument._id = new Types.ObjectId();

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
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
      categories: [],
      recipient: undefined,
      projects: [],
    }, Cypress.env('EXPIRES_IN'));
    splitTransactionDocument._id = new Types.ObjectId();

    transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
        amount: 100,
        transferAccountId: createAccountId(transferAccountDocument._id),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: accountDocument,
      transferAccount: transferAccountDocument,
    }, Cypress.env('EXPIRES_IN'));
    transferTransactionDocument._id = new Types.ObjectId();
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
        .requestDeleteTransaction(createTransactionId(paymentTransactionDocument._id))
        .expectNoContentResponse()
        .validateTransactionDeleted(createTransactionId(paymentTransactionDocument._id));
    });

    it('should delete split transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(createTransactionId(splitTransactionDocument._id))
        .expectNoContentResponse()
        .validateTransactionDeleted(createTransactionId(splitTransactionDocument._id));
    });

    it('should delete transfer transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(createTransactionId(transferTransactionDocument._id))
        .expectNoContentResponse()
        .validateTransactionDeleted(createTransactionId(transferTransactionDocument._id));
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
