import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';

export const recipientService = recipientServiceFactory(mongodbService);