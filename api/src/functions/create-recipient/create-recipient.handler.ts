import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateRecipientService } from '@household/api/functions/create-recipient/create-recipient.service';
import { getExpiresInHeader } from '@household/shared/common/utils';

export default (createRecipient: ICreateRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let recipientId: string;
    try {
      recipientId = await createRecipient({
        body,
        expiresIn: Number(getExpiresInHeader(event)),
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
