import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { projectServiceFactory } from '@household/shared/services/project-service';

const mongoDbService = await mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING.replace('{{ENV}}', process.env.ENV));

export const projectService = projectServiceFactory(mongoDbService);
