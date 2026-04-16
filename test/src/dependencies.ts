import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';
import { projectServiceFactory } from '@household/shared/services/project-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';

const mongoDbService = await mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING.replace('{{ENV}}', process.env.ENV));

export const categoryService = categoryServiceFactory(mongoDbService);
export const projectService = projectServiceFactory(mongoDbService);
export const recipientService = recipientServiceFactory(mongoDbService);
