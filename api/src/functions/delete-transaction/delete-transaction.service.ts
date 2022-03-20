import { httpError } from '@household/shared/common/utils';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface IDeleteTransactionService {
  (ctx: {
    transactionId: Transaction.IdType;
  }): Promise<void>;
}

export const deleteTransactionServiceFactory = (
  databaseService: IDatabaseService): IDeleteTransactionService => {
  return async ({ transactionId }) => {
    await databaseService.deleteTransaction(transactionId).catch((error) => {
      console.error('Delete transaction', error);
      throw httpError(500, 'Error while deleting transaction');
    });
  };
};
