import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    expiresIn: number;
  }): Promise<Transaction.Id>;
}

export const createTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, transferAccountId, payments } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });
    const transactionIds: Transaction.Id[] = [];
    payments?.forEach(({ transactionId }) => {
      pushUnique(transactionIds, transactionId);
    });

    const accounts = await accountService.listAccountsByIds([
      accountId,
      transferAccountId,
    ]).catch(httpErrors.common.getRelatedData({
      accountId,
      transferAccountId,
    }));

    const account = accounts.find(a => getAccountId(a) === accountId);
    const transferAccount = accounts.find(a => getAccountId(a) === transferAccountId);

    httpErrors.account.notFound(!account, {
      accountId,
    }, 400);

    httpErrors.account.notFound(!transferAccount, {
      accountId: transferAccountId,
    }, 400);

    let document: Transaction.TransferDocument | Transaction.LoanTransferDocument;

    if (account.accountType === 'loan' || transferAccount.accountType === 'loan') {
      if (account.accountType === transferAccount.accountType) {
        body.payments = undefined;
        document = transactionDocumentConverter.createTransferDocument({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);
      } else {
        document = transactionDocumentConverter.createLoanTransferDocument({
          body,
          account,
          transferAccount,
        }, expiresIn);
      }
    } else {
      if (body.payments) {
        const transactionIds: Transaction.Id[] = [];
        let total = 0;
        body.payments?.forEach(({ transactionId, amount }) => {
          total += amount;
          pushUnique(transactionIds, transactionId);
        });

        httpErrors.transaction.sumOfPayments(total > Math.abs(body.amount), body);

        const payingAccount = body.amount < 0 ? transferAccount : account;

        const transactionList = await transactionService.listDeferredTransactions({
          payingAccountIds: [getAccountId(payingAccount)],
          transactionIds,
        });

        httpErrors.transaction.multipleNotFound(transactionIds.length !== transactionList.length, {
          transactionIds,
        });
        const transactions = toDictionary(transactionList, '_id');

        document = transactionDocumentConverter.createTransferDocument({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);
      } else {
        document = transactionDocumentConverter.createTransferDocument({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);
      }
    }

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
