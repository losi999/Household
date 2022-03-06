
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListTransactionsService } from '@household/api/functions/list-transactions/list-transactions.service';
import { Transaction } from '@household/shared/types/types';

export default (listTransactions: IListTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let transactions: Transaction.Response[];
    try {
      transactions = await listTransactions();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
