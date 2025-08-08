import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/update-customer-job/update-customer-job.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/partials/customer-job';
import { default as pathParameters } from '@household/shared/schemas/customer-id-job-name';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { updateCustomerJobServiceFactory } from '@household/api/functions/update-customer-job/update-customer-job.service';

const updateCustomerJobService = updateCustomerJobServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(updateCustomerJobService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
