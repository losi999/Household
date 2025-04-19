
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListDeferredTransactionsService } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';
import { Transaction } from '@household/shared/types/types';

export default (listDeferredTransactions: IListDeferredTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let transactions: Transaction.Response[];

    try {
      transactions = await listDeferredTransactions();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
