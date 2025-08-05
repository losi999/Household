import { accountServiceFactory } from '@household/shared/services/account-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { productServiceFactory } from '@household/shared/services/product-service';
import { projectServiceFactory } from '@household/shared/services/project-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';
import { settingServiceFactory } from '@household/shared/services/setting-service';
import { transactionServiceFactory } from '@household/shared/services/transaction-service';
import { identityServiceFactory } from '@household/shared/services/identity-service';
import { storageServiceFactory } from '@household/shared/services/storage-service';
import { cognito } from '@household/shared/dependencies/aws/cognito';
import { fileServiceFactory } from '@household/shared/services/file-service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, s3Client } from '@household/shared/dependencies/aws/s3';
import { Upload } from '@aws-sdk/lib-storage';

const mongoDbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING.replace('{{ENV}}', process.env.ENV));

export const projectService = projectServiceFactory(mongoDbService);
export const recipientService = recipientServiceFactory(mongoDbService);
export const accountService = accountServiceFactory(mongoDbService);
export const categoryService = categoryServiceFactory(mongoDbService);
export const transactionService = transactionServiceFactory(mongoDbService);
export const productService = productServiceFactory(mongoDbService);
export const settingService = settingServiceFactory(mongoDbService);
export const fileService = fileServiceFactory(mongoDbService);
export const identityService = identityServiceFactory(process.env.USER_POOL_ID, '', cognito);
export const storageService = storageServiceFactory(s3, s3Client, getSignedUrl, Upload)(process.env.IMPORT_BUCKET);
