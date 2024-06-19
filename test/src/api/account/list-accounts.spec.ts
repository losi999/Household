import { default as schema } from '@household/test/api/schemas/account-response-list';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';

describe('GET /account/v1/accounts', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let secondaryAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let invertedTransferTransactionDocument: Transaction.TransferDocument;
  let repayingTransferTransactionDocument: Transaction.TransferDocument;
  let invertedRepayingTransferTransactionDocument: Transaction.TransferDocument;
  let loanTransferTransactionDocument: Transaction.LoanTransferDocument;
  let invertedLoanTransferTransactionDocument: Transaction.LoanTransferDocument;
  let payingDeferredTransactionDocument: Transaction.DeferredDocument;
  let owningDeferredTransactionDocument: Transaction.DeferredDocument;
  let payingDeferredToLoanTransactionDocument: Transaction.DeferredDocument;
  let owningReimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let deferredSplitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    secondaryAccountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: 'loan',
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
    });

    deferredSplitTransactionDocument = splitTransactionDataFactory.document({
      account: secondaryAccountDocument,
      splits: [
        {
          loanAccount: accountDocument,
        },
        {
          loanAccount: loanAccountDocument,
        },
        {},
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

    loanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });

    invertedLoanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccountList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of accounts', () => {
      const expectedBalance1 = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.amount + payingDeferredTransactionDocument.amount + repayingTransferTransactionDocument.amount + invertedRepayingTransferTransactionDocument.transferAmount + payingDeferredToLoanTransactionDocument.amount;
      const expectedLoanBalance1 = payingDeferredTransactionDocument.amount - owningDeferredTransactionDocument.amount - deferredSplitTransactionDocument.deferredSplits[0].amount - repayingTransferTransactionDocument.payments[0].amount + invertedRepayingTransferTransactionDocument.payments[0].amount + payingDeferredToLoanTransactionDocument.amount;

      const expectedBalance2 = deferredSplitTransactionDocument.deferredSplits[1].amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.amount - owningReimbursementTransactionDocument.amount + payingDeferredToLoanTransactionDocument.amount;

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
        .authenticate(1)
        .requestGetAccountList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountListResponse([
          accountDocument,
          loanAccountDocument,
        ], [
          expectedBalance1,
          expectedBalance2,
        ], [
          expectedLoanBalance1,
          0,
        ]);
    });
  });
});
