import { default as handler } from '@household/api/functions/delete-project/delete-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { deleteProjectServiceFactory } from '@household/api/functions/delete-project/delete-project.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { projectService } from '@household/shared/dependencies/services/project-service';

const deleteProjectService = deleteProjectServiceFactory(projectService);

export default cors(apiRequestValidator({
  pathParameters,
})(handler(deleteProjectService)));
