import { IMigrateLoanTransactionsService } from '@household/api/functions/migrate-loan-transactions/migrate-loan-transactions.service';

export default (migrateLoanTransactions: IMigrateLoanTransactionsService): AWSLambda.Handler =>
  async () => {
    await migrateLoanTransactions();
  };
