import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, s3Client } from '@household/shared/dependencies/aws/s3';
import { storageServiceFactory } from '@household/shared/services/storage-service';

export const importStorageService = storageServiceFactory(s3, s3Client, getSignedUrl)(process.env.IMPORT_BUCKET);
export const databaseArchiveStorageService = storageServiceFactory(s3, s3Client, getSignedUrl)(process.env.DATABASE_ARCHIVE_BUCKET);
