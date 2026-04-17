import { default as schema } from '@household/test/schemas/account-response-list';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { AccountType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test, expect as domainExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect);

const permissionMap = forbidUsers();

test.describe('GET /account/v1/accounts', () => {
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

  test.beforeEach(async () => {
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

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListAccounts }) => {
      const res = await requestListAccounts();
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestListAccounts }) => {
          const res = await requestListAccounts();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of accounts', async ({ requestListAccounts }) => {
          const expectedBalance1 = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.transferAmount + payingDeferredTransactionDocument.amount + repayingTransferTransactionDocument.amount + invertedRepayingTransferTransactionDocument.transferAmount + payingDeferredToLoanTransactionDocument.amount;

          const expectedBalance2 = loanTransferTransactionDocument.transferAmount + invertedLoanTransferTransactionDocument.amount - deferredSplitTransactionDocument.deferredSplits[1].amount + owningReimbursementTransactionDocument.amount - payingDeferredToLoanTransactionDocument.amount;

          await accountService.saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
          await transactionService.saveTransactions(paymentTransactionDocument, splitTransactionDocument, transferTransactionDocument, invertedTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, payingDeferredTransactionDocument, owningDeferredTransactionDocument, payingDeferredToLoanTransactionDocument, owningReimbursementTransactionDocument, deferredSplitTransactionDocument, repayingTransferTransactionDocument, invertedRepayingTransferTransactionDocument);
          const res = await requestListAccounts();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchAccountDocumentInList(accountDocument, expectedBalance1);
          expect(res).toMatchAccountDocumentInList(loanAccountDocument, expectedBalance2);
        });
      }
    });
  });
});
