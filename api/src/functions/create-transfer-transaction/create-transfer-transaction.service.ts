import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId, pushUnique, toDictionary } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
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
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, transferAccountId, payments } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });

    const accounts = await accountService.findAccountsByIds([
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

    let document: Transaction.TransferDocument;

    if (account.accountType === AccountType.Loan || transferAccount.accountType === AccountType.Loan) {
      body.payments = undefined;
      document = transferTransactionDocumentConverter.create({
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
        }).catch(httpErrors.common.getRelatedData({
          deferredTransactionIds,
        }));

        httpErrors.transaction.multipleNotFound({
          transactionIds: deferredTransactionIds,
          transactions: transactionList,
        });
        const transactions = toDictionary(transactionList, '_id');

        document = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);
      } else {
        document = transferTransactionDocumentConverter.create({
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
