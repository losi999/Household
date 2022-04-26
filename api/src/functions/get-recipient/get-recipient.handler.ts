import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetRecipientService } from '@household/api/functions/get-recipient/get-recipient.service';
import { castPathParameters } from '@household/shared/common/utils';
import { Recipient } from '@household/shared/types/types';

export default (getRecipient: IGetRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { recipientId } = castPathParameters(event);

    let recipient: Recipient.Response;
    try {
      recipient = await getRecipient({
        recipientId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(recipient);
  };
};
