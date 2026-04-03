import { calculateAccountBalances } from '@household/shared/common/aggregate-helpers';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account } from '@household/shared/types/types';
import { Types, UpdateQuery } from 'mongoose';

export interface IAccountService {
  saveAccount(doc: Account.Document): Promise<Account.Document>;
  saveAccounts(docs: Account.Document[]): Promise<unknown>;
  findAccountById(accountId: Account.Id): Promise<Account.Document>;
  findAccountsByIds(accountIds: Account.Id[]): Promise<Account.Document[]>;
  getAccountById(accountId: Account.Id): Promise<Account.Document>;
  deleteAccount(accountId: Account.Id): Promise<unknown>;
  updateAccount(accountId: Account.Id, updateQuery: UpdateQuery<Account.Document>): Promise<unknown>;
  listAccounts(): Promise<Account.Document[]>;
}

export const accountServiceFactory = (mongodbService: IMongodbService): IAccountService => {
  const instance: IAccountService = {
    saveAccount: async (doc) => {
      const [account] = await mongodbService.accounts((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return account;
    },
    saveAccounts: (docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.accounts.insertMany(docs, {
          session,
        });
      });
    },
    findAccountById: (accountId) => {
      if (accountId) {
        return mongodbService.accounts((model, session) => {
          return model.findById(accountId)
            .session(session)
            .lean();        
        }); 
      }
    },
    getAccountById: async (accountId) => {
      if (accountId) {
        const [account] = await mongodbService.accounts((model, session) => {
          return model.aggregate([
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
            });            
        });

        return account;
      }
    },
    deleteAccount: async (accountId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.accounts.deleteOne({
          _id: accountId,
        }, {
          session,
        });
          
        await models.transactions.deleteMany({
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
        });

        await models.transactions.updateMany({
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

        return models.transactions.updateMany({
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
              'splits._id',
            ],
          },
        ],
        {
          session,
        });
      });
    },
    updateAccount: async (accountId, updateQuery) => {
      return mongodbService.accounts((model, session) => {
        return model.findByIdAndUpdate(accountId, updateQuery, {
          runValidators: true,
          session,
        });
      });
    },
    listAccounts: () => {
      return mongodbService.accounts((model, session) => {
        return model.aggregate([
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
          });
          
      });
    },
    findAccountsByIds: async (accountIds) => {
      if(!accountIds?.length) {
        return [];
      }
      
      return mongodbService.accounts((model, session) => {
        return model.find({
          _id: {
            $in: accountIds,
          },
        }).session(session)
          .lean();
          
      });
    },
  };

  return instance;
};
