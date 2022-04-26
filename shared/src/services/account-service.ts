import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { Aggregate, Types } from 'mongoose';

export interface IAccountService {
  dumpAccounts(): Promise<Account.Document[]>;
  saveAccount(doc: Account.Document): Promise<Account.Document>;
  getAccountById(accountId: Account.IdType): Promise<Account.Document>;
  deleteAccount(accountId: Account.IdType): Promise<unknown>;
  updateAccount(doc: Account.Document): Promise<unknown>;
  listAccounts(): Promise<Account.Document[]>;
  listAccountsByIds(accountIds: Account.IdType[]): Promise<Account.Document[]>;
}

export const accountServiceFactory = (mongodbService: IMongodbService): IAccountService => {
  const aggregateAccountBalance = (aggregate: Aggregate<any[]>): Aggregate<any[]> => {
    return aggregate.lookup({
      from: 'transactions()',
      localField: '_id',
      foreignField: 'account',
      as: 'in',
    })
      .lookup({
        from: 'transactions()',
        localField: '_id',
        foreignField: 'transferAccount',
        as: 'out',
      })
      .addFields({
        balance: {
          $subtract: [
            {
              $sum: '$in.amount',
            },
            {
              $sum: '$out.amount',
            },
          ],
        },
      })
      .project({
        in: false,
        out: false,
      });
  };

  const instance: IAccountService = {
    dumpAccounts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.accounts().find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveAccount: (doc) => {
      return mongodbService.accounts().create(doc);
    },
    getAccountById: async (accountId) => {
      const [account] = await aggregateAccountBalance(mongodbService.accounts().aggregate()
        .match({
          _id: new Types.ObjectId(accountId),
        })).exec();

      return !accountId ? undefined : account;
    },
    deleteAccount: async (accountId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.accounts().deleteOne({
            _id: accountId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions().deleteMany({
            $or: [
              {
                account: accountId,
              },
              {
                transferAccount: accountId,
              },
            ],
          }, {
            session,
          })
            .exec();
        });
      });
    },
    updateAccount: (doc) => {
      return mongodbService.accounts().replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    listAccounts: () => {
      return mongodbService.inSession((session) => {
        return aggregateAccountBalance(mongodbService.accounts().aggregate(null, {
          session,
        }))
          .collation({
            locale: 'hu',
          })
          .sort({
            name: 1,
          })
          .exec();
      });
    },
    listAccountsByIds: async (accountIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.accounts().find({
          _id: {
            $in: accountIds,
          },
        }, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
  };

  return instance;
};
