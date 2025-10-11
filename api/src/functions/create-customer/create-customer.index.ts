import { createCustomerServiceFactory } from '@household/api/functions/create-customer/create-customer.service';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/create-customer/create-customer.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/customer-request';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const createCustomerService = createCustomerServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(createCustomerService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
