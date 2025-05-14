import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('DELETE /account/v1/accounts/{accountId}', () => {
  let accountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteAccount(accountDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestDeleteAccount(accountDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should delete account', () => {
          cy.saveAccountDocument(accountDocument)
            .authenticate(userType)
            .requestDeleteAccount(getAccountId(accountDocument))
            .expectNoContentResponse()
            .validateAccountDeleted(getAccountId(accountDocument));
        });

        describe('related transactions', () => {
          let loanAccountDocument: Account.Document;
          let secondaryAccountDocument: Account.Document;
          let paymentTransactionDocument: Transaction.PaymentDocument;
          let splitTransactionDocument: Transaction.SplitDocument;
          let transferTransactionDocument: Transaction.TransferDocument;
          let invertedTransferTransactionDocument: Transaction.TransferDocument;
          let repayingTransferTransactionDocument: Transaction.TransferDocument;
          let invertedRepayingTransferTransactionDocument: Transaction.TransferDocument;
          let loanTransferTransactionDocument: Transaction.TransferDocument;
          let invertedLoanTransferTransactionDocument: Transaction.TransferDocument;
          let payingDeferredTransactionDocument: Transaction.DeferredDocument;
          let owningDeferredTransactionDocument: Transaction.DeferredDocument;
          let payingDeferredToLoanTransactionDocument: Transaction.DeferredDocument;
          let owningReimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let deferredSplitTransactionDocument: Transaction.SplitDocument;

          beforeEach(() => {
            secondaryAccountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
            });

            splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
            });

            deferredSplitTransactionDocument = splitTransactionDataFactory.document({
              account: secondaryAccountDocument,
              loans: [
                {
                  loanAccount: accountDocument,
                },
                {
                  loanAccount: loanAccountDocument,
                },
              ],
            });

            transferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: secondaryAccountDocument,
            });

            invertedTransferTransactionDocument = transferTransactionDataFactory.document({
              account: secondaryAccountDocument,
              transferAccount: accountDocument,
            });

            loanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: loanAccountDocument,
              transferAccount: accountDocument,
            });

            payingDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: secondaryAccountDocument,
            });

            payingDeferredToLoanTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
            });

            owningDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: secondaryAccountDocument,
              loanAccount: accountDocument,
            });

            owningReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              loanAccount: accountDocument,
            });

            repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: secondaryAccountDocument,
              transactions: [owningDeferredTransactionDocument],
            });

            invertedRepayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: secondaryAccountDocument,
              transferAccount: accountDocument,
              transactions: [payingDeferredTransactionDocument],
            });

          });
          it('should be deleted if account is deleted', () => {
            cy.saveAccountDocuments([
              loanAccountDocument,
              accountDocument,
              secondaryAccountDocument,
            ])
              .saveTransactionDocuments([
                paymentTransactionDocument,
                splitTransactionDocument,
                transferTransactionDocument,
                invertedTransferTransactionDocument,
                loanTransferTransactionDocument,
                invertedLoanTransferTransactionDocument,
                payingDeferredTransactionDocument,
                owningDeferredTransactionDocument,
                payingDeferredToLoanTransactionDocument,
                owningReimbursementTransactionDocument,
                deferredSplitTransactionDocument,
                repayingTransferTransactionDocument,
                invertedRepayingTransferTransactionDocument,
              ])
              .authenticate(userType)
              .requestDeleteAccount(getAccountId(accountDocument))
              .expectNoContentResponse()
              .validateAccountDeleted(getAccountId(accountDocument))
              .validateTransactionDeleted(getTransactionId(paymentTransactionDocument))
              .validateTransactionDeleted(getTransactionId(splitTransactionDocument))
              .validateTransactionDeleted(getTransactionId(transferTransactionDocument))
              .validateTransactionDeleted(getTransactionId(invertedTransferTransactionDocument))
              .validateTransactionDeleted(getTransactionId(loanTransferTransactionDocument))
              .validateTransactionDeleted(getTransactionId(invertedLoanTransferTransactionDocument))
              .validateTransactionDeleted(getTransactionId(payingDeferredTransactionDocument))
              .validateTransactionDeleted(getTransactionId(payingDeferredToLoanTransactionDocument))
              .validateTransactionDeleted(getTransactionId(owningReimbursementTransactionDocument))
              .validateTransactionDeleted(getTransactionId(repayingTransferTransactionDocument))
              .validateTransactionDeleted(getTransactionId(invertedRepayingTransferTransactionDocument))
              .validateConvertedToPaymentDocument(owningDeferredTransactionDocument)
              .validateConvertedToRegularSplitItemDocument(deferredSplitTransactionDocument, getAccountId(accountDocument));
          });
        });

        describe('should return error', () => {
          describe('if accountId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestDeleteAccount(accountDataFactory.id('not-valid'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
