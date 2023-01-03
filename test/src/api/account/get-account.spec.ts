import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as schema } from '@household/test/api/schemas/account-response';
import { Account, Transaction } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { getAccountId } from '@household/shared/common/utils';
import { v4 as uuid } from 'uuid';

describe('GET /account/v1/accounts/{accountId}', () => {
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let invertedTransferTransactionDocument: Transaction.TransferDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: `account-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'), true);
    transferAccountDocument = accountDocumentConverter.create({
      name: `transfer-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
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
        transferAmount: -100,
        transferAccountId: getAccountId(transferAccountDocument),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: accountDocument,
      transferAccount: transferAccountDocument,
    }, Cypress.env('EXPIRES_IN'), true);

    invertedTransferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: getAccountId(transferAccountDocument),
        amount: -100,
        transferAmount: 100,
        transferAccountId: getAccountId(accountDocument),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: transferAccountDocument,
      transferAccount: accountDocument,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccount(createAccountId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get account by id', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .saveTransactionDocument(invertedTransferTransactionDocument)
        .authenticate(1)
        .requestGetAccount(getAccountId(accountDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountResponse(accountDocument, 400);
    });

    describe('should return error if accountId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestGetAccount(createAccountId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('accountId', 'pathParameters');
      });

      it('does not belong to any account', () => {
        cy.authenticate(1)
          .requestGetAccount(createAccountId())
          .expectNotFoundResponse();
      });
    });
  });
});
