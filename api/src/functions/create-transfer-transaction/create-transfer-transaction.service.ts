import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    expiresIn: number;
  }): Promise<string>;
}

export const createTransferTransactionServiceFactory = (
  accountService: IAccountService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    if (body.accountId === body.transferAccountId) {
      console.error('Cannot transfer to same account', body.accountId, body.transferAccountId);
      throw httpError(400, 'Cannot transfer to same account');
    }

    const accounts = await accountService.listAccountsByIds([
      body.accountId,
      body.transferAccountId,
    ]).catch((error) => {
      console.error('Unable to query related data', error, body);
      throw httpError(500, 'Unable to query related data');
    });

    if (accounts.length !== 2) {
      console.error('One of the accounts is not found', body.accountId, body.transferAccountId);
      throw httpError(400, 'One of the accounts is not found');
    }

    const account = accounts.find(x => x._id.toString() === body.accountId);
    const transferAccount = accounts.find(x => x._id.toString() === body.transferAccountId);

    if (account.currency !== transferAccount.currency) {
      console.error('Accounts must be in the same currency');
      throw httpError(400, 'Accounts must be in the same currency');
    }

    const document = transactionDocumentConverter.createTransferDocument({
      body,
      account,
      transferAccount,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch((error) => {
      console.error('Save transaction', error);
      throw httpError(500, 'Error while saving transaction');
    });

    return saved._id.toString();
  };
};
