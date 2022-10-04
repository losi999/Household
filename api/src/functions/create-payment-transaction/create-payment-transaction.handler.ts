import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreatePaymentTransactionService } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (createPaymentTransaction: ICreatePaymentTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let transactionId: string;
    try {
      transactionId = await createPaymentTransaction({
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
