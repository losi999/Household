import { entries, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { forbidUsers } from '@household/test/api/utils';

const permissionMap = forbidUsers('viewer') ;

describe('DELETE /transaction/v1/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let loanTransferTransactionDocument: Transaction.TransferDocument;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    transferAccountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
      loans: [
        {
          loanAccount: loanAccountDocument,
        },
      ],
    });

    transferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: transferAccountDocument,
    });

    deferredTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });

    reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
      account: loanAccountDocument,
      loanAccount: accountDocument,
    });

    loanTransferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestDeleteTransaction(paymentTransactionDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestDeleteTransaction(paymentTransactionDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        describe('should delete', () => {
          it('payment transaction', () => {
            cy.saveAccountDocument(accountDocument)
              .saveTransactionDocument(paymentTransactionDocument)
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(paymentTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(paymentTransactionDocument));
          });

          it('split transaction', () => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [splitTransactionDocument.deferredSplits[0]],
            });

            cy.saveAccountDocuments([
              accountDocument,
              transferAccountDocument,
              loanAccountDocument,
            ])
              .saveTransactionDocuments([
                splitTransactionDocument,
                repayingTransferTransactionDocument,
              ])
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(splitTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(splitTransactionDocument))
              .validateRelatedRepaymentDeleted(getTransactionId(splitTransactionDocument.deferredSplits[0]), getTransactionId(repayingTransferTransactionDocument));
          });

          it('transfer transaction', () => {
            cy.saveAccountDocuments([
              accountDocument,
              transferAccountDocument,
            ])
              .saveTransactionDocument(transferTransactionDocument)
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(transferTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(transferTransactionDocument));
          });
          it('deferred transaction', () => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [deferredTransactionDocument],
            });

            cy.saveAccountDocuments([
              accountDocument,
              transferAccountDocument,
              loanAccountDocument,
            ])
              .saveTransactionDocuments([
                deferredTransactionDocument,
                repayingTransferTransactionDocument,
              ])
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(deferredTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(deferredTransactionDocument))
              .validateRelatedRepaymentDeleted(getTransactionId(deferredTransactionDocument), getTransactionId(repayingTransferTransactionDocument));
          });

          it('reimbursement transaction', () => {
            cy.saveAccountDocuments([
              accountDocument,
              loanAccountDocument,
            ])
              .saveTransactionDocument(reimbursementTransactionDocument)
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(reimbursementTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(reimbursementTransactionDocument));
          });

          it('loan transfer transaction', () => {
            cy.saveAccountDocuments([
              accountDocument,
              loanAccountDocument,
            ])
              .saveTransactionDocument(loanTransferTransactionDocument)
              .authenticate(userType)
              .requestDeleteTransaction(getTransactionId(loanTransferTransactionDocument))
              .expectNoContentResponse()
              .validateTransactionDeleted(getTransactionId(loanTransferTransactionDocument));
          });
        });
        describe('should return error', () => {
          describe('if transactionId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestDeleteTransaction(paymentTransactionDataFactory.id('not-valid'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('transactionId', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
