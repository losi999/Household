import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, s3Client } from '@household/shared/dependencies/aws/s3';
import { storageServiceFactory } from '@household/shared/services/storage-service';
import { Upload } from '@aws-sdk/lib-storage';

export const storageService = storageServiceFactory(s3, s3Client, getSignedUrl, Upload);

export const importStorageService = storageService(process.env.IMPORT_BUCKET);
export const databaseArchiveStorageService = storageService(process.env.DATABASE_ARCHIVE_BUCKET);
