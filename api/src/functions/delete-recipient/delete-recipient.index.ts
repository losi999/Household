import { default as handler } from '@household/api/functions/delete-recipient/delete-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteRecipientServiceFactory } from '@household/api/functions/delete-recipient/delete-recipient.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const deleteRecipientService = deleteRecipientServiceFactory(recipientService);

export default index({
  handler: handler(deleteRecipientService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
