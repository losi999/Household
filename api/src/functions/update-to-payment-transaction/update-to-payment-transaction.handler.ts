import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateToPaymentTransactionService } from '@household/api/functions/update-to-payment-transaction/update-to-payment-transaction.service';
import { castPathParameters } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';

export default (updateTransaction: IUpdateToPaymentTransactionService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { transactionId } = castPathParameters(event);

    try {
      await updateTransaction({
        transactionId,
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
