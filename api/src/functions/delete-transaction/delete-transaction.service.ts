import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteTransactionService {
  (ctx: {
    transactionId: Api.Transaction.Id;
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
