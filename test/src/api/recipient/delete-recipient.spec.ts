import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getAccountId, getRecipientId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';
describe('DELETE /recipient/v1/recipients/{recipientId}', () => {
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create({
      name: `recipient-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteRecipient(createRecipientId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete recipient', () => {
      cy.saveRecipientDocument(recipientDocument)
        .authenticate(1)
        .requestDeleteRecipient(getRecipientId(recipientDocument))
        .expectNoContentResponse()
        .validateRecipientDeleted(getRecipientId(recipientDocument));
    });

    describe('in related transactions recipient', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: `account-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
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
            recipientId: getRecipientId(recipientDocument),
          },
          account: accountDocument,
          category: undefined,
          project: undefined,
          recipient: recipientDocument,
          product: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            recipientId: getRecipientId(recipientDocument),
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
          recipient: recipientDocument,
          categories: {},
          projects: {},
          products: {},
        }, Cypress.env('EXPIRES_IN'), true);
      });

      it('should be unset if recipient is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveRecipientDocument(recipientDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteRecipient(getRecipientId(recipientDocument))
          .expectNoContentResponse()
          .validateRecipientDeleted(getRecipientId(recipientDocument))
          .validateRecipientUnset(paymentTransactionDocument)
          .validateRecipientUnset(splitTransactionDocument);
      });
    });

    describe('should return error', () => {
      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteRecipient(createRecipientId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });
      });
    });
  });
});
