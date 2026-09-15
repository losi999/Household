import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetRecipientService } from '@household/api/functions/get-recipient/get-recipient.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (getRecipient: IGetRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { recipientId } = castPathParameters(event);

    let recipient: Responses.Recipient;
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
