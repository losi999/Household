import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-recipient/update-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { updateRecipientServiceFactory } from '@household/api/functions/update-recipient/update-recipient.service';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';
import { default as body } from '@household/shared/schemas/recipient';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';

const updateRecipientService = updateRecipientServiceFactory(databaseService, recipientDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateRecipientService))));
