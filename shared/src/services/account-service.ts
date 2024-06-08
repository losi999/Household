import { calculateAccountBalance } from '@household/shared/services/aggregates/calculate-account-balance';
import { getAccountWithBalance } from '@household/shared/services/aggregates/get-account-with-balance';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

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
        [account] = await mongodbService.inSession((session) => {
          return mongodbService.accounts.aggregate(getAccountWithBalance(accountId))
            .session(session)
            .collation({
              locale: 'hu',
            })
            .exec();
        });
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
        return mongodbService.accounts.aggregate(calculateAccountBalance)
          .session(session)
          .collation({
            locale: 'hu',
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
