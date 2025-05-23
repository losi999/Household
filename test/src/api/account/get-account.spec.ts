import { default as schema } from '@household/test/api/schemas/account-response';
import { Account, Transaction } from '@household/shared/types/types';
import { getAccountId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { AccountType } from '@household/shared/enums';

describe('GET /account/v1/accounts/{accountId}', () => {
  let accountDocument: Account.Document;
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
    accountDocument = accountDataFactory.document();
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccount(accountDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    beforeEach(() => {
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
        ]);
    });
    it('should get account by id', () => {
      const expectedBalance = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.transferAmount + payingDeferredTransactionDocument.amount + repayingTransferTransactionDocument.amount + invertedRepayingTransferTransactionDocument.transferAmount + payingDeferredToLoanTransactionDocument.amount;

      cy.authenticate(1)
        .requestGetAccount(getAccountId(accountDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountResponse(accountDocument, expectedBalance);
    });

    it('should get loan account by id', () => {
      const expectedBalance = loanTransferTransactionDocument.transferAmount + invertedLoanTransferTransactionDocument.amount - deferredSplitTransactionDocument.deferredSplits[1].amount + owningReimbursementTransactionDocument.amount - payingDeferredToLoanTransactionDocument.amount;

      cy.authenticate(1)
        .requestGetAccount(getAccountId(loanAccountDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateAccountResponse(loanAccountDocument, expectedBalance);
    });

    describe('should return error if accountId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestGetAccount(accountDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('accountId', 'pathParameters');
      });

      it('does not belong to any account', () => {
        cy.authenticate(1)
          .requestGetAccount(accountDataFactory.id())
          .expectNotFoundResponse();
      });
    });
  });
});
