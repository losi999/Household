import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as handler } from '@household/api/functions/list-users/list-users.handler';
import { listUsersServiceFactory } from '@household/api/functions/list-users/list-users.service';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listUsersService = listUsersServiceFactory(identityService);

export default index({
  handler: handler(listUsersService),
  before: [authorizer(UserType.Editor)],
  after: [cors],
});
