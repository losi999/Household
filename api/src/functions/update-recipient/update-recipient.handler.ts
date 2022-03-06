import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateRecipientService } from '@household/api/functions/update-recipient/update-recipient.service';
import { castPathParameters } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';

export default (updateRecipient: IUpdateRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { recipientId } = castPathParameters(event);

    try {
      await updateRecipient({
        recipientId,
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
