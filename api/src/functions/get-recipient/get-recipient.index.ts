import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/get-recipient/get-recipient.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { getRecipientServiceFactory } from '@household/api/functions/get-recipient/get-recipient.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/recipient-id';

const getRecipientService = getRecipientServiceFactory(databaseService, recipientDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(getRecipientService))));
