import { createRecipientServiceFactory } from '@household/api/functions/create-recipient/create-recipient.service';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as handler } from '@household/api/functions/create-recipient/create-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/recipient';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';

const createRecipientService = createRecipientServiceFactory(recipientService, recipientDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createRecipientService))));
