import { getRecipientId } from '@household/shared/common/utils';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { splitTransactionDataFactory } from '../transaction/split-data-factory';
import { paymentTransactionDataFactory } from '../transaction/payment-data-factory';
import { recipientDataFactory } from './data-factory';
import { accountDataFactory } from '../account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';

describe('DELETE /recipient/v1/recipients/{recipientId}', () => {
  let recipientDocument: Recipient.Document;

  beforeEach(() => {
    recipientDocument = recipientDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteRecipient(recipientDataFactory.id())
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
      let unrelatedRecipientDocument: Recipient.Document;
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let deferredTransactionDocument: Transaction.DeferredDocument;
      let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
      let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
      let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
      let unrelatedSplitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;
      let loanAccountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDataFactory.document();
        loanAccountDocument = accountDataFactory.document({
          accountType: 'loan',
        });

        unrelatedRecipientDocument = recipientDataFactory.document();

        paymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          recipient: recipientDocument,
        });

        deferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          recipient: recipientDocument,
          loanAccount: loanAccountDocument,
        });

        reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          recipient: recipientDocument,
          loanAccount: accountDocument,
        });

        unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          recipient: unrelatedRecipientDocument,
        });

        unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          recipient: unrelatedRecipientDocument,
          loanAccount: loanAccountDocument,
        });

        unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          recipient: unrelatedRecipientDocument,
          loanAccount: accountDocument,
        });

        splitTransactionDocument = splitTransactionDataFactory.document({
          account: accountDocument,
          recipient: recipientDocument,
        });

        unrelatedSplitTransactionDocument = splitTransactionDataFactory.document({
          account: accountDocument,
          recipient: recipientDocument,
        });
      });

      it('should be unset if recipient is deleted', () => {
        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveRecipientDocuments([
            recipientDocument,
            unrelatedRecipientDocument,
          ])
          .saveTransactionDocuments([
            paymentTransactionDocument,
            splitTransactionDocument,
            deferredTransactionDocument,
            reimbursementTransactionDocument,
            unrelatedPaymentTransactionDocument,
            unrelatedDeferredTransactionDocument,
            unrelatedReimbursementTransactionDocument,
            unrelatedSplitTransactionDocument,
          ])
          .authenticate(1)
          .requestDeleteRecipient(getRecipientId(recipientDocument))
          .expectNoContentResponse()
          .validateRecipientDeleted(getRecipientId(recipientDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          })
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            recipient: {
              from: getRecipientId(recipientDocument),
            },
          });
      });
    });

    describe('should return error', () => {
      describe('if recipientId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteRecipient(recipientDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });
      });
    });
  });
});
