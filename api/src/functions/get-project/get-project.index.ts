import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as handler } from '@household/api/functions/get-project/get-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getProjectServiceFactory } from '@household/api/functions/get-project/get-project.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const getProjectService = getProjectServiceFactory(projectService, projectDocumentConverter);

export default index({
  handler: handler(getProjectService),
  before: [
    authorizer(UserType.Editor, UserType.Viewer),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
