import { AccountType, TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateTransactionsService {
  (): Promise<void>;
}

export const migrateTransactionsServiceFactory = (mongodbService: IMongodbService): IMigrateTransactionsService => {
  return async () => {
    const loanAccounts = (await mongodbService.accounts.find({
      accountType: AccountType.Loan,
    })).map(a => a._id);

    await mongodbService.transactions.updateMany({
      transactionType: 'loanTransfer',
      transferAccount: {
        $in: loanAccounts,
      },
    }, [
      {
        $set: {
          transactionType: 'transfer',
          transferAmount: {
            $multiply: [
              '$amount',
              -1,
            ],
          },
        },
      },
    ]);

    await mongodbService.transactions.updateMany({
      transactionType: 'loanTransfer',
      account: {
        $in: loanAccounts,
      },
    }, [
      {
        $set: {
          transactionType: 'transfer',
          transferAmount: '$amount',
          amount: {
            $multiply: [
              '$amount',
              -1,
            ],
          },
        },
      },
    ]);

    await mongodbService.transactions.updateMany({
      transactionType: TransactionType.Split,
      'splits._id': {
        $exists: 1,
      },
    },
    [
      {
        $unset: 'splits._id',
      },
    ]);
  };
};
