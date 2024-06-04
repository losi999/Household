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
  const accountAggregate = (accountId?: Account.Id): Aggregate<any[]> => {
    return mongodbService.transactions.aggregate([
      {
        $unwind: {
          path: '$splits',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          dupes: [
            {
              account: '$account',
              amount: {
                $ifNull: [
                  '$splits.amount',
                  '$amount',
                ],
              },
              loanAmount: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          {
                            $ifNull: [
                              '$splits.loan',
                              '$loan',
                            ],
                          },
                          true,
                        ],
                      },
                      {
                        $lte: [
                          {
                            $ifNull: [
                              '$splits.loanAccount',
                              '$loanAccount',
                            ],
                          },
                          null,
                        ],

                      },
                    ],
                  },
                  then: {
                    $multiply: [
                      {
                        $ifNull: [
                          '$splits.amount',
                          '$amount',
                        ],
                      },
                      -1,
                    ],

                  },
                  else: 0,
                },
              },
            },
            {
              account: '$transferAccount',
              amount: '$transferAmount',
            },
            {
              account: {
                $ifNull: [
                  '$splits.loanAccount',
                  '$loanAccount',
                ],
              },
              amount: {
                $multiply: [
                  {
                    $ifNull: [
                      '$splits.amount',
                      '$amount',
                    ],
                  },
                  -1,
                ],
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$dupes',

        },
      },
      {
        $project: {
          account: '$dupes.account',
          amount: '$dupes.amount',
          loanAmount: '$dupes.loanAmount',
        },
      },
      {
        $match: {
          account: accountId ? new Types.ObjectId(accountId) : {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: '$account',
          balance: {
            $sum: '$amount',
          },
          loanBalance: {
            $sum: '$loanAmount',
          },
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                balance: '$balance',
                loanBalance: '$loanBalance',
              },
              {
                $arrayElemAt: [
                  '$account',
                  0,
                ],
              },
            ],
          },
        },
      },
    ]);
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
        [account] = await accountAggregate(accountId)
          .exec();
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
        return accountAggregate()
          .session(session)
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
