import { default as handler } from '@household/api/functions/migrate-loan-transactions/migrate-loan-transactions.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { migrateLoanTransactionsServiceFactory } from '@household/api/functions/migrate-loan-transactions/migrate-loan-transactions.service';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const migrateLoanTransactionssService = migrateLoanTransactionsServiceFactory(mongodbService);

export default index({
  handler: handler(migrateLoanTransactionssService),
  before: [],
  after: [],
});
