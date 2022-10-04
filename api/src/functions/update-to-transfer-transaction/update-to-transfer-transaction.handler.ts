import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateToTransferTransactionService } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateTransaction: IUpdateToTransferTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { transactionId } = castPathParameters(event);

    try {
      await updateTransaction({
        transactionId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
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
