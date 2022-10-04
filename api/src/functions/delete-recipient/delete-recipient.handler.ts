import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteRecipientService } from '@household/api/functions/delete-recipient/delete-recipient.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteRecipient: IDeleteRecipientService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { recipientId } = castPathParameters(event);

    try {
      await deleteRecipient({
        recipientId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
