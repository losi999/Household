import { getAccountId } from '@household/shared/common/utils';
import { Account, Transaction } from '@household/shared/types/types';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';
import { loanTransferTransactionDocumentConverter } from '@household/shared/dependencies/converters/loan-transfer-transaction-document-converter';

export const loanTransferTransactionDataFactory = (() => {

  const createLoanTransferTransactionDocument = (ctx: {
    body?: Partial<Transaction.TransferRequest>;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions?: Transaction.DeferredDocument[];
  }): Transaction.LoanTransferDocument => {
    if ((ctx.account.accountType === 'loan') === (ctx.transferAccount.accountType === 'loan')) {
      throw 'One of the accounts must be loan type in loan transfer transaction';
    }

    return loanTransferTransactionDocumentConverter.create({
      body: transferTransactionDataFactory.request({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        transferAccountId: getAccountId(ctx.transferAccount),
        transferAmount: undefined,
      }),
      account: ctx.account,
      transferAccount: ctx.transferAccount,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    document: createLoanTransferTransactionDocument,
  };
})();
