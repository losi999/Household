import { createRecipientServiceFactory } from '@household/api/functions/create-recipient/create-recipient.service';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as handler } from '@household/api/functions/create-recipient/create-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/recipient-request';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const createRecipientService = createRecipientServiceFactory(recipientService, recipientDocumentConverter);

export default index({
  handler: handler(createRecipientService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
