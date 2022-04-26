import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { accountServiceFactory } from '@household/shared/services/account-service';

export const accountService = accountServiceFactory(mongodbService);
