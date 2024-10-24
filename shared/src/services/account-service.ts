import { calculateAccountBalances } from '@household/shared/common/aggregate-helpers';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { Types, UpdateQuery } from 'mongoose';

export interface IAccountService {
  dumpAccounts(): Promise<Account.Document[]>;
  saveAccount(doc: Account.Document): Promise<Account.Document>;
  saveAccounts(docs: Account.Document[]): Promise<unknown>;
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
    saveAccounts: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.accounts.insertMany(docs, {
            session,
          });
        });
      });
    },
    getAccountById: async (accountId) => {
      let account: Account.Document;
      if (accountId) {
        [account] = await mongodbService.inSession((session) => {
          return mongodbService.accounts.aggregate([
            {
              $match: {
                _id: new Types.ObjectId(accountId),
              },
            },
            ...calculateAccountBalances(),
          ])
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
              {
                payingAccount: accountId,
              },
              {
                transactionType: 'reimbursement',
                ownerAccount: accountId,
              },
            ],
          }, {
            session,
          })
            .exec();

          await mongodbService.transactions.updateMany({
            transactionType: 'deferred',
            ownerAccount: accountId,
          }, [
            {
              $set: {
                transactionType: 'payment',
                account: '$payingAccount',
              },
            },
            {
              $unset: [
                'ownerAccount',
                'payingAccount',
                'isSettled',
              ],
            },
          ], {
            session,
          });

          return mongodbService.transactions.updateMany({
            'deferredSplits.ownerAccount': accountId,
          }, [
            {
              $set: {
                splits: {
                  $concatArrays: [
                    '$splits',
                    {
                      $filter: {
                        input: '$deferredSplits',
                        cond: {
                          $eq: [
                            '$$this.ownerAccount',
                            {
                              $toObjectId: accountId,
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                deferredSplits: {
                  $filter: {
                    input: '$deferredSplits',
                    cond: {
                      $ne: [
                        '$$this.ownerAccount',
                        {
                          $toObjectId: accountId,
                        },
                      ],
                    },
                  },
                },
              },
            },
            {
              $unset: [
                'splits.payingAccount',
                'splits.transactionType',
                'splits.ownerAccount',
                'splits.isSettled',
              ],
            },
          ],
          {
            session,
          });
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
        return mongodbService.accounts.aggregate([
          ...calculateAccountBalances(),
          {
            $sort: {
              name: 1,
            },
          },
        ])
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
