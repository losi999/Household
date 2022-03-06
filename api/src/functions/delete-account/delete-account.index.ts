import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/delete-account/delete-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { deleteAccountServiceFactory } from '@household/api/functions/delete-account/delete-account.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/account-id';

const deleteAccountService = deleteAccountServiceFactory(databaseService);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(deleteAccountService))));
