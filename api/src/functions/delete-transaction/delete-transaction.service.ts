import { httpError } from '@household/shared/common/utils';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IDeleteTransactionService {
  (ctx: {
    transactionId: Transaction.IdType;
  }): Promise<void>;
}

export const deleteTransactionServiceFactory = (
  transactionService: ITransactionService): IDeleteTransactionService => {
  return async ({ transactionId }) => {
    await transactionService.deleteTransaction(transactionId).catch((error) => {
      console.error('Delete transaction', error);
      throw httpError(500, 'Error while deleting transaction');
    });
  };
};
