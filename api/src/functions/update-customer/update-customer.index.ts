import { default as handler } from '@household/api/functions/update-customer/update-customer.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateCustomerServiceFactory } from '@household/api/functions/update-customer/update-customer.service';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as pathParameters } from '@household/shared/schemas/customer-id';
import { default as body } from '@household/shared/schemas/customer-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateCustomerService = updateCustomerServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(updateCustomerService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
