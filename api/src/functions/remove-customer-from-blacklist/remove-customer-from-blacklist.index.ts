import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/customer-blacklist-request';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { removeCustomerFromBlacklistServiceFactory } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.service';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const removeCustomerFromBlacklistService = removeCustomerFromBlacklistServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(removeCustomerFromBlacklistService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
