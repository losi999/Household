import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateTransferTransactionService {
  (ctx: {
    body: Transaction.TransferRequest;
    expiresIn: number;
  }): Promise<string>;
}

export const createTransferTransactionServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateTransferTransactionService => {
  return async ({ body, expiresIn }) => {
    if (body.accountId === body.transferAccountId) {
      console.error('Cannot transfer to same account', body.accountId, body.transferAccountId)
      throw httpError(400, 'Cannot transfer to same account');
    }

    const accounts = await databaseService.listAccountsByIds([body.accountId, body.transferAccountId]);

    if (accounts.length !== 2) {
      console.error('One of the accounts are not found', body.accountId, body.transferAccountId);
      throw httpError(400, 'One of the accounts are not found');
    }

    const account = accounts.find(x => x._id.toString() === body.accountId);
    const transferAccount = accounts.find(x => x._id.toString() === body.transferAccountId);

    if (account.currency !== transferAccount.currency) {
      console.error('Accounts must be in the same currency');
      throw httpError(400, 'Accounts must be in the same currency')
    }

    const document = transactionDocumentConverter.createTransferDocument({ body, account, transferAccount }, expiresIn);

    const saved = await databaseService.saveTransaction(document);

    return saved._id.toString();
  };
};
