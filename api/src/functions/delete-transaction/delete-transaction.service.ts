import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IDeleteTransactionService {
  (ctx: {
    transactionId: Transaction.Id;
  }): Promise<unknown>;
}

export const deleteTransactionServiceFactory = (
  transactionService: ITransactionService): IDeleteTransactionService => {
  return ({ transactionId }) => {
    return transactionService.deleteTransaction(transactionId).catch(httpErrors.transaction.delete({
      transactionId,
    }));
  };
};
