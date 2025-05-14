import { default as handler } from '@household/api/functions/delete-project/delete-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteProjectServiceFactory } from '@household/api/functions/delete-project/delete-project.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const deleteProjectService = deleteProjectServiceFactory(projectService);

export default index({
  handler: handler(deleteProjectService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
