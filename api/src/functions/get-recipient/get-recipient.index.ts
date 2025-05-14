import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as handler } from '@household/api/functions/get-recipient/get-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getRecipientServiceFactory } from '@household/api/functions/get-recipient/get-recipient.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const getRecipientService = getRecipientServiceFactory(recipientService, recipientDocumentConverter);

export default index({
  handler: handler(getRecipientService),
  before: [
    authorizer(UserType.Editor, UserType.Viewer),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
