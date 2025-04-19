import { default as handler } from '@household/api/functions/migrate-transactions/migrate-transactions.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { migrateTransactionsServiceFactory } from '@household/api/functions/migrate-transactions/migrate-transactions.service';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const migrateTransactionssService = migrateTransactionsServiceFactory(mongodbService);

export default index({
  handler: handler(migrateTransactionssService),
  before: [],
  after: [],
});
