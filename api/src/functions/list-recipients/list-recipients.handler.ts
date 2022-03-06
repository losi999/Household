
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListRecipientsService } from '@household/api/functions/list-recipients/list-recipients.service';
import { Recipient } from '@household/shared/types/types';

export default (listRecipients: IListRecipientsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let recipients: Recipient.Response[];
    try {
      recipients = await listRecipients();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(recipients);
  };
};
