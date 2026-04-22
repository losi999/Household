import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';

export const mongoDbService = await mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);
