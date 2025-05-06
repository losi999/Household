import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { settingServiceFactory } from '@household/shared/services/setting-service';

export const settingService = settingServiceFactory(mongodbService);
