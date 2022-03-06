import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteTransactionService } from '@household/api/functions/delete-transaction/delete-transaction.service';
import { castPathParameters } from '@household/shared/common/utils';

export default (deleteTransaction: IDeleteTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { transactionId } = castPathParameters(event);

    try {
      await deleteTransaction({
        transactionId
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
