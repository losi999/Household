import { default as handler } from '@household/api/functions/merge-projects/merge-projects.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { default as body } from '@household/shared/schemas/project-id-list';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeProjectsServiceFactory } from '@household/api/functions/merge-projects/merge-projects.service';

const mergeProjectsService = mergeProjectsServiceFactory(projectService);

export default index({
  handler: handler(mergeProjectsService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
