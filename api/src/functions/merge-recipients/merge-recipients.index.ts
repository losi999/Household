import { default as handler } from '@household/api/functions/merge-recipients/merge-recipients.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { recipientId as pathParameters, idList as body } from '@household/shared/schemas/recipient';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeRecipientsServiceFactory } from '@household/api/functions/merge-recipients/merge-recipients.service';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const mergeRecipientsService = mergeRecipientsServiceFactory(recipientService);

export default index({
  handler: handler(mergeRecipientsService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
