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

        const { _id, ...document } = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document).catch(httpErrors.transaction.update({
          _id,
          ...document,
        }));
      } else {
        const { _id, ...document } = transferTransactionDocumentConverter.create({
          body,
          account,
          transferAccount,
          transactions: undefined,
        }, expiresIn);

        await transactionService.replaceTransaction(transactionId, document).catch(httpErrors.transaction.update({
          _id,
          ...document,
        }));
      }
    }
  };
};
