
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListDeferredTransactionsService } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';
import { Responses } from '@household/shared/types/responses';

export default (listDeferredTransactions: IListDeferredTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let transactions: Responses.Transaction[];

    try {
      transactions = await listDeferredTransactions();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
