import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IUpdateToTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    transactionId: Transaction.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateToTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
): IUpdateToTransferTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const { accountId, transferAccountId, payments } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });

    const queriedDocument = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound({
      transaction: queriedDocument,
      transactionId,
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

    httpErrors.account.notFound({
      account,
      accountId,
    }, 400);

    httpErrors.account.notFound({
      accountId: transferAccountId,
      account: transferAccount,
    }, 400);

    let update: UpdateQuery<Transaction.Document>;

    if (account.accountType === AccountType.Loan || transferAccount.accountType === AccountType.Loan) {
      body.payments = undefined;
      update = transferTransactionDocumentConverter.update({
        body,
        account,
        transferAccount,
        transactions: undefined,
      }, expiresIn);
    } else {
      if (payments) {
        const deferredTransactionIds: Transaction.Id[] = [];
        payments?.forEach(({ transactionId }) => {
          pushUnique(deferredTransactionIds, transactionId);
        });

        const transactionList = await transactionService.listDeferredTransactions({
          deferredTransactionIds,
          excludedTransferTransactionId: transactionId,
        }).catch(httpErrors.common.getRelatedData({
          deferredTransactionIds,
        }));

        httpErrors.transaction.multipleNotFound({
          transactionIds: deferredTransactionIds,
          transactions: transactionList,
        });
        const transactions = toDictionary(transactionList, '_id');

        update = transferTransactionDocumentConverter.update({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);

      } else {
        update = transferTransactionDocumentConverter.update({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);
      }
    }

    return transactionService.updateTransaction(transactionId, update).catch(httpErrors.transaction.update(update));
  };
};
