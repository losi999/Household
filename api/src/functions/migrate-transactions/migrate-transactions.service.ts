import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

export interface IMigrateTransactionsService {
  (): Promise<void>;
}

export const migrateTransactionsServiceFactory = (mongodbService: IMongodbService): IMigrateTransactionsService => {
  return async () => {
    await mongodbService.inSession((session) => {
      return session.withTransaction(async () => {
        const splits = await mongodbService.transactions.find<Transaction.SplitDocument>({
          transactionType: 'split',
          splits: {
            $elemMatch: {
              _id: {
                $exists: false,
              },
            },
          },
        }, null, {
          session,
        });

        await mongodbService.transactions.bulkWrite(splits.map(doc => {
          doc.splits.forEach(s => {
            if (!s._id) {
              s._id = new Types.ObjectId();
            }
          });

          return {
            updateOne: {
              filter: {
                _id: doc._id,
              },
              update: {
                splits: doc.splits,
              },
            },
          };
        }), {
          session,
        });

        const loanAccountIds = (await mongodbService.accounts.find({
          accountType: 'loan',
        }, null, {
          session,
        }).exec()).map(a => a._id);

        await mongodbService.transactions.updateMany({
          transactionType: 'transfer',
          account: {
            $in: loanAccountIds,
          },
        }, [
          {
            $set: {
              amount: '$transferAmount',
              transactionType: 'loanTransfer',
            },
          },
          {
            $unset: 'transferAmount',
          },
        ], {
          session,
        });

        await mongodbService.transactions.updateMany({
          transactionType: 'transfer',
          transferAccount: {
            $in: loanAccountIds,
          },
        }, [
          {
            $set: {
              transactionType: 'loanTransfer',
            },
          },
          {
            $unset: 'transferAmount',
          },
        ], {
          session,
        });
      }, {
        session,
      });
    });
  };
};
