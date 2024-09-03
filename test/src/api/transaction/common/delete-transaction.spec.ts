import { getTransactionId } from '@household/shared/common/utils';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer/loan-transfer-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';

describe('DELETE /transaction/v1/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let loanTransferTransactionDocument: Transaction.LoanTransferDocument;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    transferAccountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: 'loan',
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
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

    loanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteTransaction(paymentTransactionDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete payment transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(paymentTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(paymentTransactionDocument));
    });

    it('should delete split transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(splitTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(splitTransactionDocument));
    });

    it('should delete transfer transaction', () => {
      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveTransactionDocument(transferTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(transferTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(transferTransactionDocument));
    });

    it('should delete deferred transaction', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveTransactionDocument(deferredTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(deferredTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(deferredTransactionDocument));
    });

    it('should delete reimbursement transaction', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveTransactionDocument(reimbursementTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(reimbursementTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(reimbursementTransactionDocument));
    });

    it('should delete loan transfer transaction', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveTransactionDocument(loanTransferTransactionDocument)
        .authenticate(1)
        .requestDeleteTransaction(getTransactionId(loanTransferTransactionDocument))
        .expectNoContentResponse()
        .validateTransactionDeleted(getTransactionId(loanTransferTransactionDocument));
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteTransaction(paymentTransactionDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });
      });
    });
  });
});
