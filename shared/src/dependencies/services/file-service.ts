import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { fileServiceFactory } from '@household/shared/services/file-service';

export const fileService = fileServiceFactory(mongodbService);
