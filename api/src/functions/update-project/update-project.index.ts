import { default as handler } from '@household/api/functions/update-project/update-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateProjectServiceFactory } from '@household/api/functions/update-project/update-project.service';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { default as body } from '@household/shared/schemas/project-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateProjectService = updateProjectServiceFactory(projectService, projectDocumentConverter);

export default index({
  handler: handler(updateProjectService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
