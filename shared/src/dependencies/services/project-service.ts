import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { projectServiceFactory } from '@household/shared/services/project-service';

export const projectService = projectServiceFactory(mongodbService);
