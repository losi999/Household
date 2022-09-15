import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as schema } from '@household/test/api/schemas/account-response';
import { Account, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';

describe('GET /account/v1/accounts/{accountId}', () => {
  const account: Account.Request = {
    name: 'account',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let invertedTransferTransactionDocument: Transaction.TransferDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create(account, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();

    transferAccountDocument = accountDocumentConverter.create(account, Cypress.env('EXPIRES_IN'));
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

    invertedTransferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: createAccountId(transferAccountDocument._id),
        amount: -100,
        transferAccountId: createAccountId(accountDocument._id),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: transferAccountDocument,
      transferAccount: accountDocument,
    }, Cypress.env('EXPIRES_IN'));
    invertedTransferTransactionDocument._id = new Types.ObjectId();
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
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .saveTransactionDocument(invertedTransferTransactionDocument)
        .authenticate('admin1')
        .requestGetAccount(createAccountId(accountDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountResponse(accountDocument, 400);
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