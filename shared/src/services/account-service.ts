import { calculateAccountBalances } from '@household/shared/common/aggregate-helpers';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { DocumentUpdate } from '@household/shared/types/common';
import { Types } from 'mongoose';

export interface IAccountService {
  saveAccount(doc: Documents.Account): Promise<Documents.Account>;
  saveAccounts(...docs: Documents.Account[]): Promise<unknown>;
  findAccountById(accountId: Api.Account.Id): Promise<Documents.Account>;
  findAccountsByIds(accountIds: Api.Account.Id[]): Promise<Documents.Account[]>;
  getAccountById(accountId: Api.Account.Id): Promise<Documents.Account>;
  deleteAccount(accountId: Api.Account.Id): Promise<unknown>;
  updateAccount(accountId: Api.Account.Id, updateQuery: DocumentUpdate<Documents.Account>): Promise<unknown>;
  listAccounts(): Promise<Documents.Account[]>;
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
    saveAccounts: (...docs) => {
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
          updatePipeline: true,
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
          updatePipeline: true,
        });
      });
    },
    updateAccount: async (accountId, { update }) => {
      return mongodbService.accounts((model, session) => {
        return model.findByIdAndUpdate(accountId, update, {
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
