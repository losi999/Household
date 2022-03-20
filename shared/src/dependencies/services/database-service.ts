import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { databaseServiceFactory } from '@household/shared/services/database-service';

export const databaseService = databaseServiceFactory(mongodbService);