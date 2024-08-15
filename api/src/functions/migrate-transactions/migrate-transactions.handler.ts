
import { IMigrateTransactionsService } from '@household/api/functions/migrate-transactions/migrate-transactions.service';

export default (migrateTransactions: IMigrateTransactionsService): AWSLambda.Handler =>
  async () => {
    await migrateTransactions();
  };
