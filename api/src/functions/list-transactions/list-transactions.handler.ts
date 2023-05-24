
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListTransactionsService } from '@household/api/functions/list-transactions/list-transactions.service';
import { Transaction } from '@household/shared/types/types';

export default (listTransactions: IListTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let transactions: Transaction.ReportResponse;
    try {
      transactions = await listTransactions(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
