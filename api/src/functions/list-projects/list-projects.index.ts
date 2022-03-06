import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/list-projects/list-projects.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listProjectsServiceFactory } from '@household/api/functions/list-projects/list-projects.service';

const listProjectsService = listProjectsServiceFactory(databaseService, projectDocumentConverter);

export default cors(/*authorizer('admin')*/(handler(listProjectsService)));
