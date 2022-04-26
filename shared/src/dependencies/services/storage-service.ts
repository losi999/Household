import { s3 } from '@household/shared/dependencies/aws/s3';
import { storageServiceFactory } from '@household/shared/services/storage-service';

export const storageService = storageServiceFactory(s3);
