import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    expiresIn: number;
  }): Promise<Transaction.IdType>;
}

export const createTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, transferAccountId } = body;

    httpErrors.transaction.sameAccountTransfer({
      accountId,
      transferAccountId,
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

    const document = transactionDocumentConverter.createTransferDocument({
      body,
      account,
      transferAccount,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
