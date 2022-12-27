import { default as handler } from '@household/api/functions/merge-recipients/merge-recipients.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';
import { default as body } from '@household/shared/schemas/recipient-id-list';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeRecipientsServiceFactory } from '@household/api/functions/merge-recipients/merge-recipients.service';

const mergeRecipientsService = mergeRecipientsServiceFactory(recipientService);

export default index({
  handler: handler(mergeRecipientsService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
