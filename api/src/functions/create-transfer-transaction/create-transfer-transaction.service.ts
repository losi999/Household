import { httpErrors } from '@household/api/common/error-handlers';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Requests } from '@household/shared/types/requests';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Requests.TransferTransaction;
  } & ExpiresIn): Promise<Api.Transaction.Id>;
}

export const createTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transferTransactionDocumentConverter: ITransferTransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    const { accountId, transferAccountId } = body;

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

    const document = transferTransactionDocumentConverter.create({
      body,
      account,
      transferAccount,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch(httpErrors.transaction.save(document));

    return getTransactionId(saved);
  };
};
