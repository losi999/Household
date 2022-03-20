import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateSplitTransactionService } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { headerExpiresIn } from '@household/shared/constants';

export default (createSplitTransaction: ICreateSplitTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let transactionId: string;
    try {
      transactionId = await createSplitTransaction({
        body,
        expiresIn: Number(event.headers[headerExpiresIn]),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      transactionId,
    });
  };
};
