import { TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateTransactionsService {
  (): Promise<void>;
}

export const migrateTransactionsServiceFactory = (mongodbService: IMongodbService): IMigrateTransactionsService => {
  return async () => {
    await mongodbService.transactions.updateMany({
      transactionType: 'loanTransfer',
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
