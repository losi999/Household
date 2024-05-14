import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, s3Client } from '@household/shared/dependencies/aws/s3';
import { storageServiceFactory } from '@household/shared/services/storage-service';

export const storageService = storageServiceFactory(s3, s3Client, getSignedUrl);
