import { httpError } from '@household/shared/common/utils';
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
    if (body.accountId === body.transferAccountId) {
      console.error('Cannot transfer to same account', body.accountId, body.transferAccountId);
      throw httpError(400, 'Cannot transfer to same account');
    }

    const document = await transactionService.getTransactionById(transactionId).catch((error) => {
      console.error('Get transaction', error);
      throw httpError(500, 'Error while getting transaction');
    });

    if (!document) {
      throw httpError(404, 'No transaction found');
    }

    const accounts = await accountService.listAccountsByIds([
      body.accountId,
      body.transferAccountId,
    ]).catch((error) => {
      console.error('Unable to query related data', error, body);
      throw httpError(500, 'Unable to query related data');
    });

    if (accounts.length !== 2) {
      console.error('One of the accounts are not found', body.accountId, body.transferAccountId);
      throw httpError(400, 'One of the accounts are not found');
    }

    const account = accounts.find(x => x._id.toString() === body.accountId);
    const transferAccount = accounts.find(x => x._id.toString() === body.transferAccountId);

    if (account.currency !== transferAccount.currency) {
      console.error('Accounts must be in the same currency');
      throw httpError(400, 'Accounts must be in the same currency');
    }

    const updated = transactionDocumentConverter.updateTransferDocument({
      document,
      body,
      account,
      transferAccount,
    }, expiresIn);

    await transactionService.updateTransaction(updated).catch((error) => {
      console.error('Update transaction', error);
      throw httpError(500, 'Error while updating transaction');
    });
  };
};
