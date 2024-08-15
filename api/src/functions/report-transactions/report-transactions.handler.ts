
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IReportTransactionsService } from '@household/api/functions/report-transactions/report-transactions.service';
import { Transaction } from '@household/shared/types/types';

export default (reportTransactions: IReportTransactionsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let transactions: Transaction.Report[];
    try {
      transactions = await reportTransactions(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
