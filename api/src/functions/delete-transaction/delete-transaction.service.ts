import { httpErrors } from '@household/api/common/error-handlers';
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
    await transactionService.deleteTransaction(transactionId).catch(httpErrors.transaction.delete({
      transactionId,
    }));
  };
};
