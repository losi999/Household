import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    transactionId: Transaction.Id;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
  loanTransferDocumentDonverter: ILoanTransferTransactionDocumentConverter,
): IUpdateToTransferTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const { accountId, transferAccountId, payments } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });

    const document = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound(!document, {
      transactionId,
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

    if (account.accountType === 'loan' || transferAccount.accountType === 'loan') {
      if (account.accountType === transferAccount.accountType) {
        body.payments = undefined;
        const { _id, ...document } = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document);
      } else {
        const { _id, ...document } = loanTransferDocumentDonverter.create({
          body,
          account,
          transferAccount,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document);
      }
    } else {
      if (body.payments) {
        const deferredTransactionIds: Transaction.Id[] = [];
        body.payments?.forEach(({ transactionId }) => {
          pushUnique(deferredTransactionIds, transactionId);
        });

        const payingAccount = body.amount < 0 ? transferAccount : account;

        const transactionList = await transactionService.listDeferredTransactions({
          payingAccountIds: [getAccountId(payingAccount)],
          deferredTransactionIds,
          excludedTransferTransactionId: transactionId,
        });

        httpErrors.transaction.multipleNotFound(deferredTransactionIds.length !== transactionList.length, {
          transactionIds: deferredTransactionIds,
        });
        const transactions = toDictionary(transactionList, '_id');

        const { _id, ...document } = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document);
      } else {
        const { _id, ...document } = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document);
      }
    }
  };
};
