import { default as handler } from '@household/api/functions/merge-projects/merge-projects.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { projectId as pathParameters, idList as body } from '@household/shared/schemas/project';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeProjectsServiceFactory } from '@household/api/functions/merge-projects/merge-projects.service';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const mergeProjectsService = mergeProjectsServiceFactory(projectService);

export default index({
  handler: handler(mergeProjectsService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
