
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListDeferredTransactionsService } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';
import { parseStringToBoolean } from '@household/shared/common/utils';
import { Transaction } from '@household/shared/types/types';

export default (listDeferredTransactions: IListDeferredTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    let transactions: Transaction.Response[];

    try {
      transactions = await listDeferredTransactions({
        isSettled: parseStringToBoolean(event.queryStringParameters?.isSettled),
        transactionIds: event.multiValueQueryStringParameters?.transactionId as Transaction.Id[],
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
