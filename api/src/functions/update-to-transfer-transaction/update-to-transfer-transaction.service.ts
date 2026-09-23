import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateToTransferTransactionService {
  (ctx: {
    body: Requests.TransferTransaction;
  } & Api.Transaction.TransactionId & ExpiresIn): Promise<unknown>;
}

export const updateToTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
): IUpdateToTransferTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const { accountId, transferAccountId } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
    });

    const queriedDocument = await transactionService.findTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound({
      transaction: queriedDocument,
      transactionId,
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

    const update = transferTransactionDocumentConverter.update({
      body,
      account,
      transferAccount,
    }, expiresIn);

    return transactionService.updateTransaction(transactionId, update).catch(httpErrors.transaction.update(update));
  };
};
