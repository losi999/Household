import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-project/update-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { updateProjectServiceFactory } from '@household/api/functions/update-project/update-project.service';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as pathParameters } from '@household/shared/schemas/project-id';
import { default as body } from '@household/shared/schemas/project';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';

const updateProjectService = updateProjectServiceFactory(databaseService, projectDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateProjectService))));
