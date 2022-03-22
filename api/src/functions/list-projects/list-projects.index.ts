import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as handler } from '@household/api/functions/list-projects/list-projects.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listProjectsServiceFactory } from '@household/api/functions/list-projects/list-projects.service';
import { projectService } from '@household/shared/dependencies/services/project-service';

const listProjectsService = listProjectsServiceFactory(projectService, projectDocumentConverter);

export default cors(handler(listProjectsService));
