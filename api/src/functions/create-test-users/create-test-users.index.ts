import { default as handler } from '@household/api/functions/create-test-users/create-test-users.handler';
import { createTestUsersServiceFactory } from '@household/api/functions/create-test-users/create-test-users.service';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as index } from '@household/api/handlers/index.handler';

const createTestUserService = createTestUsersServiceFactory(identityService);

export default index({
  handler: handler(createTestUserService),
  before: [],
  after: [],
});
