
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetTransactionService } from '@household/api/functions/get-transaction/get-transaction.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (getTransaction: IGetTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { transactionId, accountId } = castPathParameters(event);

    let transaction: Responses.Transaction;
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
