import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';

export const mongodbService = await mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);
