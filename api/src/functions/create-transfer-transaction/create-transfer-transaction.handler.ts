import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateTransferTransactionService } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (createTransferTransaction: ICreateTransferTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let transactionId: string;

    try {
      transactionId = await createTransferTransaction({
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
