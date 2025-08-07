import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/create-customer-job/create-customer-job.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/partials/customer-job';
import { default as pathParameters } from '@household/shared/schemas/customer-id';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { createCustomerJobServiceFactory } from '@household/api/functions/create-customer-job/create-customer-job.service';

const createCustomerJobService = createCustomerJobServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(createCustomerJobService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
