import { createRecipientId } from '@household/shared/common/test-data-factory';
import { getRecipientId } from '@household/shared/common/utils';
import { AccountType, UserType } from '@household/shared/enums';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';

describe('POST recipient/v1/recipients/{recipientId}/merge', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let sourceRecipientDocument: Recipient.Document;
  let targetRecipientDocument: Recipient.Document;
  let unrelatedRecipientDocument: Recipient.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
  let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
  let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let unrelatedSplitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    sourceRecipientDocument = recipientDataFactory.document();
    targetRecipientDocument = recipientDataFactory.document();
    unrelatedRecipientDocument = recipientDataFactory.document();

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
      recipient: sourceRecipientDocument,
    });

    deferredTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      recipient: sourceRecipientDocument,
      loanAccount: loanAccountDocument,
    });

    reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
      account: loanAccountDocument,
      recipient: sourceRecipientDocument,
      loanAccount: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
      recipient: sourceRecipientDocument,
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

    unrelatedSplitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
      recipient: unrelatedRecipientDocument,
    });

  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestMergeRecipients(createRecipientId(), [createRecipientId()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should merge recipients', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveRecipientDocuments([
          sourceRecipientDocument,
          targetRecipientDocument,
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
        .authenticate(UserType.Editor)
        .requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)])
        .expectCreatedResponse()
        .validateRecipientDeleted(getRecipientId(sourceRecipientDocument))
        .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        })
        .validateRelatedChangesInSplitDocument(unrelatedSplitTransactionDocument, {
          recipient: {
            from: getRecipientId(sourceRecipientDocument),
            to: getRecipientId(targetRecipientDocument),
          },
        });
    });

    describe('should return error', () => {
      it('if a source precipient does not exist', () => {
        cy.saveRecipientDocument(targetRecipientDocument)
          .saveRecipientDocument(sourceRecipientDocument)
          .authenticate(UserType.Editor)
          .requestMergeRecipients(getRecipientId(targetRecipientDocument), [
            getRecipientId(sourceRecipientDocument),
            createRecipientId(),
          ])
          .expectBadRequestResponse()
          .expectMessage('Some of the recipients are not found');
      });
      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId(), [createRecipientId('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('if recipientId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId('not-valid'), [createRecipientId()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('recipientId', 'pathParameters');
        });

        it('does not belong to any recipient', () => {
          cy.authenticate(UserType.Editor)
            .requestMergeRecipients(createRecipientId(), [getRecipientId(sourceRecipientDocument)])
            .expectBadRequestResponse()
            .expectMessage('Some of the recipients are not found');
        });
      });
    });
  });
});
