import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { priceServiceFactory } from '@household/shared/services/price-service';

export const priceService = priceServiceFactory(mongodbService);
