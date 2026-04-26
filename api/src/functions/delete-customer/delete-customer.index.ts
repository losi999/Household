import { default as handler } from '@household/api/functions/delete-customer/delete-customer.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteCustomerServiceFactory } from '@household/api/functions/delete-customer/delete-customer.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/customer-id';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const deleteCustomerService = deleteCustomerServiceFactory(customerService);

export default index({
  handler: handler(deleteCustomerService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
