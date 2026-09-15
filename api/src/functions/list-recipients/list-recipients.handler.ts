
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListRecipientsService } from '@household/api/functions/list-recipients/list-recipients.service';
import { Responses } from '@household/shared/types/responses';

export default (listRecipients: IListRecipientsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let recipients: Responses.Recipient[];
    try {
      recipients = await listRecipients();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(recipients);
  };
};
