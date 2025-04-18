import { IMigrateTransactionsService } from '@household/api/functions/migrate-transactions/migrate-transactions.service';

export default (migrateLoanTransactions: IMigrateTransactionsService): AWSLambda.Handler =>
  async () => {
    await migrateLoanTransactions();
  };
