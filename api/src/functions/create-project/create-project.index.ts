import { createProjectServiceFactory } from '@household/api/functions/create-project/create-project.service';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as handler } from '@household/api/functions/create-project/create-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/project';
import { projectService } from '@household/shared/dependencies/services/project-service';

const createProjectService = createProjectServiceFactory(projectService, projectDocumentConverter);

export default cors(apiRequestValidator({
  body,
})(handler(createProjectService)));
