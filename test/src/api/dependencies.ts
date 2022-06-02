import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { projectServiceFactory } from '@household/shared/services/project-service';

const mongoDbService = mongodbServiceFactory(Cypress.env('MONGODB_CONNECTION_STRING'));

export const projectService = projectServiceFactory(mongoDbService);
