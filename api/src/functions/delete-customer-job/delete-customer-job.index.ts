import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/delete-customer-job/delete-customer-job.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { customerIdJobName as pathParameters } from '@household/shared/schemas/customer';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { deleteCustomerJobServiceFactory } from '@household/api/functions/delete-customer-job/delete-customer-job.service';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const deleteCustomerJobService = deleteCustomerJobServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(deleteCustomerJobService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
