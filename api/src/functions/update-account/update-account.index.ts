import { default as handler } from '@household/api/functions/update-account/update-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { updateAccountServiceFactory } from '@household/api/functions/update-account/update-account.service';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { default as body } from '@household/shared/schemas/account';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { accountService } from '@household/shared/dependencies/services/account-service';

const updateAccountService = updateAccountServiceFactory(accountService, accountDocumentConverter);

export default cors(apiRequestValidator({
  pathParameters,
  body,
})(handler(updateAccountService)));
