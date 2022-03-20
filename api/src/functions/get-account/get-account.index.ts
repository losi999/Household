import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/get-account/get-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { getAccountServiceFactory } from '@household/api/functions/get-account/get-account.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/account-id';

const getAccountService = getAccountServiceFactory(databaseService, accountDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(getAccountService))));
