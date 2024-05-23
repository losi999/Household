import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { Aggregate, Types, UpdateQuery } from 'mongoose';

export interface IAccountService {
  dumpAccounts(): Promise<Account.Document[]>;
  saveAccount(doc: Account.Document): Promise<Account.Document>;
  getAccountById(accountId: Account.Id): Promise<Account.Document>;
  deleteAccount(accountId: Account.Id): Promise<unknown>;
  updateAccount(accountId: Account.Id, updateQuery: UpdateQuery<Account.Document>): Promise<unknown>;
  listAccounts(): Promise<Account.Document[]>;
  listAccountsByIds(accountIds: Account.Id[]): Promise<Account.Document[]>;
}

export const accountServiceFactory = (mongodbService: IMongodbService): IAccountService => {
  const aggregateAccountBalance = (aggregate: Aggregate<any[]>): Aggregate<any[]> => {
    return aggregate.lookup({
      from: 'transactions',
      localField: '_id',
      foreignField: 'account',
      as: 'regular',
    })
      .lookup({
        from: 'transactions',
        localField: '_id',
        foreignField: 'transferAccount',
        as: 'inverted',
      })
      .addFields({
        balance: {
          $sum: [
            {
              $sum: '$regular.amount',
            },
            {
              $sum: '$inverted.transferAmount',
            },
          ],
        },
      })
      .project({
        regular: false,
        inverted: false,
      });
  };

  const instance: IAccountService = {
    dumpAccounts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.accounts.find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveAccount: (doc) => {
      return mongodbService.accounts.create(doc);
    },
    getAccountById: async (accountId) => {
      let account: Account.Document;
      if (accountId) {
        [account] = await aggregateAccountBalance(mongodbService.accounts.aggregate()
          .match({
            _id: new Types.ObjectId(accountId),
          })).exec();
      }

      return account ?? null;
    },
    deleteAccount: async (accountId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.accounts.deleteOne({
            _id: accountId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions.deleteMany({
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
    updateAccount: async (accountId, updateQuery) => {
      return mongodbService.accounts.findByIdAndUpdate(accountId, updateQuery, {
        runValidators: true,
      });
    },
    listAccounts: () => {
      return mongodbService.inSession((session) => {
        return aggregateAccountBalance(mongodbService.accounts.aggregate(null, {
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
    listAccountsByIds: (accountIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.accounts.find({
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
