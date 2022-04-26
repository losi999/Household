import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { transactionServiceFactory } from '@household/shared/services/transaction-service';

export const transactionService = transactionServiceFactory(mongodbService);
