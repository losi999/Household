import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateRecipientService } from '@household/api/functions/create-recipient/create-recipient.service';
import { headerExpiresIn } from '@household/shared/constants';

export default (createRecipient: ICreateRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let recipientId: string;
    try {
      recipientId = await createRecipient({
        body,
        expiresIn: Number(event.headers[headerExpiresIn]),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      recipientId,
    });
  };
};
