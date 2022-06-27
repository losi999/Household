import { accountServiceFactory } from '@household/shared/services/account-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { projectServiceFactory } from '@household/shared/services/project-service';
import { recipientServiceFactory } from '@household/shared/services/recipient-service';
import { transactionServiceFactory } from '@household/shared/services/transaction-service';

const mongoDbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

export const projectService = projectServiceFactory(mongoDbService);
export const recipientService = recipientServiceFactory(mongoDbService);
export const accountService = accountServiceFactory(mongoDbService);
export const categoryService = categoryServiceFactory(mongoDbService);
export const transactionService = transactionServiceFactory(mongoDbService);
