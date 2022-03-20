import { createAccountServiceFactory } from '@household/api/functions/create-account/create-account.service';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/create-account/create-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/account';

const createAccountService = createAccountServiceFactory(databaseService, accountDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createAccountService))));
