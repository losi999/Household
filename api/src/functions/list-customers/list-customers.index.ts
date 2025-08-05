import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { default as handler } from '@household/api/functions/list-customers/list-customers.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listCustomersServiceFactory } from '@household/api/functions/list-customers/list-customers.service';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listCustomersService = listCustomersServiceFactory(customerService, customerDocumentConverter);

export default index({
  handler: handler(listCustomersService),
  before: [authorizer(UserType.Hairdresser)],
  after: [cors],
});
