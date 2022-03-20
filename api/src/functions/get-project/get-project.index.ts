import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/get-project/get-project.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { getProjectServiceFactory } from '@household/api/functions/get-project/get-project.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/project-id';

const getProjectService = getProjectServiceFactory(databaseService, projectDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(getProjectService))));
