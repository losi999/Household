
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetTransactionService } from '@household/api/functions/get-transaction/get-transaction.service';
import { castPathParameters } from '@household/shared/common/utils';
import { Transaction } from '@household/shared/types/types';

export default (getTransaction: IGetTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { transactionId, accountId } = castPathParameters(event);

    let transaction: Transaction.Response;
    try {
      transaction = await getTransaction({
        transactionId,
        accountId,
      });
    } catch (error) {
      return errorResponse(error);
    }

    return okResponse(transaction);
  };
};
