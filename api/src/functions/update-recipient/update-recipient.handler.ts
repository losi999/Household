import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateRecipientService } from '@household/api/functions/update-recipient/update-recipient.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateRecipient: IUpdateRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { recipientId } = castPathParameters(event);

    try {
      await updateRecipient({
        recipientId,
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
