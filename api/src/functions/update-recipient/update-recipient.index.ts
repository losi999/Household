import { default as handler } from '@household/api/functions/update-recipient/update-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateRecipientServiceFactory } from '@household/api/functions/update-recipient/update-recipient.service';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';
import { default as body } from '@household/shared/schemas/recipient-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateRecipientService = updateRecipientServiceFactory(recipientService, recipientDocumentConverter);

export default index({
  handler: handler(updateRecipientService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
