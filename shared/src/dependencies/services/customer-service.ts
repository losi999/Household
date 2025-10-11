import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { customerServiceFactory } from '@household/shared/services/customer-service';

export const customerService = customerServiceFactory(mongodbService);
