import { createAccountId, createRecipientId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /recipient/v1/recipients/{recipientId}', () => {
  const recipient: Recipient.Request = {
    name: 'recipient',
  };

  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDocumentConverter.create(recipient, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();
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
        .requestDeleteRecipient(createRecipientId(recipientDocument._id))
        .expectNoContentResponse()
        .validateRecipientDeleted(createRecipientId(recipientDocument._id));
    });

    describe('in related transactions recipient', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: 'account',
          accountType: 'bankAccount',
          currency: 'Ft',
        }, Cypress.env('EXPIRES_IN'));
        accountDocument._id = new Types.ObjectId();

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
            recipientId: createRecipientId(recipientDocument._id),
          },
          account: accountDocument,
          category: undefined,
          project: undefined,
          recipient: recipientDocument,
        }, Cypress.env('EXPIRES_IN'));
        paymentTransactionDocument._id = new Types.ObjectId();

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: createAccountId(accountDocument._id),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            recipientId: createRecipientId(recipientDocument._id),
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
          categories: [],
          projects: [],
        }, Cypress.env('EXPIRES_IN'));
        splitTransactionDocument._id = new Types.ObjectId();
      });

      it('should be unset if recipient is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveRecipientDocument(recipientDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteRecipient(createRecipientId(recipientDocument._id))
          .expectNoContentResponse()
          .validateRecipientDeleted(createRecipientId(recipientDocument._id))
          .validateRecipientUnset(createTransactionId(paymentTransactionDocument._id))
          .validateRecipientUnset(createTransactionId(splitTransactionDocument._id));
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
