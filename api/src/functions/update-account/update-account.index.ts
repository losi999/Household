import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-account/update-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { updateAccountServiceFactory } from '@household/api/functions/update-account/update-account.service';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { default as body } from '@household/shared/schemas/account';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';

const updateAccountService = updateAccountServiceFactory(databaseService, accountDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateAccountService))));
