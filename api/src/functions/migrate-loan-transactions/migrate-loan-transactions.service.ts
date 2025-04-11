import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateLoanTransactionsService {
  (): Promise<void>;
}

export const migrateLoanTransactionsServiceFactory = (mongodbService: IMongodbService): IMigrateLoanTransactionsService => {
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
  };
};
