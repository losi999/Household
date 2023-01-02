import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    transactionId: Transaction.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): IUpdateToTransferTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const { accountId, transferAccountId } = body;

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

    const updated = transactionDocumentConverter.updateTransferDocument({
      document,
      body,
      account,
      transferAccount,
    }, expiresIn);

    await transactionService.updateTransaction(updated).catch(httpErrors.transaction.update(updated));
  };
};
