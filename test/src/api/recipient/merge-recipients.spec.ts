import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getAccountId, getRecipientId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST recipient/v1/recipients/{recipientId}/merge', () => {
  let accountDocument: Account.Document;
  let sourceRecipientDocument: Recipient.Document;
  let targetRecipientDocument: Recipient.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      accountType: 'bankAccount',
      currency: 'Ft',
      name: `account-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    sourceRecipientDocument = recipientDocumentConverter.create({
      name: `source-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    targetRecipientDocument = recipientDocumentConverter.create({
      name: `target-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        recipientId: getRecipientId(sourceRecipientDocument),
        description: 'desc',
        inventory: undefined,
        issuedAt: new Date().toISOString(),
        categoryId: undefined,
        projectId: undefined,
        invoice: undefined,
      },
      account: accountDocument,
      recipient: sourceRecipientDocument,
      product: undefined,
      project: undefined,
      category: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        description: 'desc',
        issuedAt: new Date().toISOString(),
        recipientId: getRecipientId(sourceRecipientDocument),
        splits: [
          {
            amount: 50,
            projectId: undefined,
            description: 'desc',
            inventory: undefined,
            categoryId: undefined,
            invoice: undefined,
          },
          {
            amount: 50,
            projectId: undefined,
            description: 'desc',
            inventory: undefined,
            categoryId: undefined,
            invoice: undefined,
          },
        ],
      },
      account: accountDocument,
      projects: {},
      products: undefined,
      recipient: sourceRecipientDocument,
      categories: {},
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestMergeRecipients(createRecipientId(), [createRecipientId()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should merge recipients', () => {
      cy.saveAccountDocument(accountDocument)
        .saveRecipientDocument(sourceRecipientDocument)
        .saveRecipientDocument(targetRecipientDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)])
        .expectCreatedResponse()
        .validateRecipientDeleted(getRecipientId(sourceRecipientDocument))
        .validatePartiallyReassignedPaymentDocument(paymentTransactionDocument, {
          recipient: getRecipientId(targetRecipientDocument),
        })
        .validatePartiallyReassignedSplitDocument(splitTransactionDocument, 0, {
          recipient: getRecipientId(targetRecipientDocument),
        });
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(1)
            .requestMergeRecipients(createRecipientId(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(1)
            .requestMergeRecipients(createRecipientId(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestMergeRecipients(createRecipientId(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeRecipients(createRecipientId(), [createRecipientId('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('is recipientId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeRecipients(createRecipientId('not-valid'), [createRecipientId()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });
      });
    });
  });
});
