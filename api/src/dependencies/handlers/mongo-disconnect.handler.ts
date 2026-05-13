import { default as mongoDisconnectHandler } from '@household/api/handlers/mongo-disconnect.handler';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

export const mongoDisconnect = mongoDisconnectHandler(mongodbService);
