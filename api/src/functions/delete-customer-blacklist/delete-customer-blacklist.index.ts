import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/delete-customer-blacklist/delete-customer-blacklist.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/customer-blacklist-request';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { deleteCustomerBlacklistServiceFactory } from '@household/api/functions/delete-customer-blacklist/delete-customer-blacklist.service';

const deleteCustomerBlacklistService = deleteCustomerBlacklistServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(deleteCustomerBlacklistService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
