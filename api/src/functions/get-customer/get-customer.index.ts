import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/get-customer/get-customer.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getCustomerServiceFactory } from '@household/api/functions/get-customer/get-customer.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/customer-id';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const getCustomerService = getCustomerServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(getCustomerService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
