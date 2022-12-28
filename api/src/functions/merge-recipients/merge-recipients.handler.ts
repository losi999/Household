import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IMergeRecipientsService } from '@household/api/functions/merge-recipients/merge-recipients.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (mergeRecipients: IMergeRecipientsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { recipientId } = castPathParameters(event);

    try {
      await mergeRecipients({
        recipientId,
        body,
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
