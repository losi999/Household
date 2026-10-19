import { populateAggregate, productAggregate } from '@household/shared/common/aggregate-helpers';
import { populate } from '@household/shared/common/mongoose-utils';
import { AccountType, TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { PipelineStage, PopulateOptions, Types } from 'mongoose';
import { Documents } from '@household/shared/types/documents';

const populateTransaction: PopulateOptions[] = populate('project',
  'recipient',
  'account',
  'transferAccount',
  'payingAccount',
  'ownerAccount',
  'category',
  {
    path: 'product',
    populate: populate('genericProduct', 'specificProduct'),
  },
  {
    path: 'splits',
    populate: populate('category', 'project', {
      path: 'product',
      populate: populate('genericProduct', 'specificProduct'),
    }),
  },
  {
    path: 'loans',
    populate: populate('payingAccount', 'ownerAccount', 'category', 'project', {
      path: 'product',
      populate: populate('genericProduct', 'specificProduct'),
    }),
  },
);

export interface ITransactionService {
  saveTransaction(doc: Documents.Transaction): Promise<Documents.Transaction>;
  saveTransactions(...docs: Documents.Transaction[]): Promise<any>;
  findTransactionById<T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T>;
  getTransactionById<T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T>;
  getTransactionByIdAndAccountId(query: Api.Transaction.TransactionId & Api.Account.AccountId): Promise<Documents.Transaction>;
  deleteTransaction(transactionId: Api.Transaction.Id): Promise<unknown>;
  updateTransaction(transactionId: Api.Transaction.Id, updateQuery: DocumentUpdate<Documents.Transaction>): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Documents.RawTransaction[]>;
  listDraftTransactionsByFileId(fileId: Api.File.Id): Promise<Documents.DraftTransaction[]>;
  listTransactionsByAccountId(data: Api.Account.AccountId & Api.Pagination<number>): Promise<Documents.Transaction[]>;
}

export const transactionServiceFactory = (mongodbService: IMongodbService): ITransactionService => {

  const instance: ITransactionService = {
    saveTransaction: async(doc) => {
      const [transaction] = await mongodbService.transactions(async (model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return transaction;
    },
    saveTransactions: (...docs) => {
      return mongodbService.inTransaction(async (models, session) => {
        return models.transactions.insertMany(docs, {
          session,
        });
      });
    },
    findTransactionById: <T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T> => {
      if (transactionId) {
        return mongodbService.transactions(async (model, session) => {
          return await model.findById(transactionId).session(session)
            .lean() as T;
        });
      }
    },
    getTransactionById: <T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T> => {
      if (transactionId) {
        return mongodbService.transactions(async (model, session) => {
          return await model.findById(transactionId)
            .setOptions({
              populate: populateTransaction,
              lean: true,
              session,
            }) as T;
        });
      }        
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      if (!transactionId || !accountId) {
        return undefined;
      }

      return mongodbService.transactions((model, session) => {
        return model.findOne({
          $and: [
            {
              _id: transactionId,
            },
            {
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
                  ownerAccount: accountId,
                },
                {
                  'loans.ownerAccount': accountId,
                },
              ],
            },
          ],
        }, {}, {
          session,
          lean: true,
          populate: populateTransaction,
        });
      });
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.inTransaction(async (models, session) => {
        const deleted = await models.transactions.findByIdAndDelete({
          _id: transactionId,
        }, {
          session,

        });

        if (deleted.transactionType === TransactionType.Payment) {
          await models.calendarEntries.updateOne({
            transaction: transactionId,
          }, 
          {
            $unset: {
              resolution: 1,
              transaction: 1,
            },
          }, {
            session,
          });
        }        
      });

    },
    updateTransaction: async (transactionId, { update: updateQuery }) => {
      return mongodbService.inTransaction(async (models, session) => {
        return models.transactions.findByIdAndUpdate(transactionId, updateQuery, {
          session,
          runValidators: true,
        });
      });
    },
    listTransactions: (match) => {
      return mongodbService.transactions(async (model, session) => {
        return model.aggregate(
          [
            {
              $match: {
                transactionType: {
                  $nin: [
                    'transfer',
                    'draft',
                  ],
                },
              },
            },
            {
              $set: {
                tmp_splits: {
                  $concatArrays: [
                    {
                      $ifNull: [
                        '$splits',
                        [],
                      ],
                    },
                    {
                      $ifNull: [
                        '$deferredSplits',
                        [],
                      ],
                    },
                  ],
                },
              },
            },
            {
              $unwind: {
                path: '$tmp_splits',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    '$$ROOT',
                    '$tmp_splits',
                    {
                      _id: '$_id',
                      account: {
                        $ifNull: [
                          '$tmp_splits.ownerAccount',
                          '$ownerAccount',
                          '$account',
                        ], 
                      },
                    },
                  ],
                },
              },
            },
            {
              $unset: [
                'tmp_splits',
                'splits',
                'deferredSplits',
                'payingAccount',
                'ownerAccount',
                'isSettled',
              ],
            },
            match,
            ...populateAggregate('account', 'accounts'),
            ...populateAggregate('category', 'categories', [
              {
                $lookup: {
                  from: 'categories',
                  localField: 'ancestors',
                  foreignField: '_id',
                  as: 'ancestors',
                },
              },
            ]),
            ...populateAggregate('project', 'projects'),
            ...populateAggregate('product', 'products', productAggregate),
            ...populateAggregate('recipient', 'recipients'),
            {
              $sort: {
                issuedAt: -1,
              },
            },
          ], {
            session,
          });

      });
    },
    listTransactionsByAccountId: async ({ accountId, pageSize, pageNumber }) => {
      const account = await mongodbService.accounts((model, session) => {
        return model.findById(accountId, {}, {
          session,
        });
      });

      return mongodbService.transactions((model, session) => {
        return model.find({
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
            ...(account.accountType === AccountType.Loan ? [
              {
                ownerAccount: accountId,
              },
              {
                'loans.ownerAccount': accountId,
              },
            ] : []),
          ],
        }, {}, {
          session,
          lean: true,
          sort: {
            issuedAt: -1,
          },
          skip: (pageNumber - 1) * pageSize,
          limit: pageSize,
          populate: populateTransaction,
        });
      });
    },
    listDraftTransactionsByFileId: (fileId) => {
      return mongodbService.transactions(async (model, session) => {
        const transactions = await model.aggregate<Documents.DraftTransaction>()
          .match({
            file: new Types.ObjectId(fileId),
          })
          .lookup({
            from: 'transactions',
            let: {
              draftAmount: {
                $abs: '$amount',
              },
              draftIssuedAt: '$issuedAt',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $ne: [
                          '$transactionType',
                          'draft',
                        ],
                      },
                      {
                        $eq: [
                          {
                            $abs: '$amount',
                          },
                          '$$draftAmount',
                        ],
                      },
                      {
                        $lte: [
                          {
                            $abs: {
                              $subtract: [
                                '$$draftIssuedAt',
                                '$issuedAt',
                              ],
                            },
                          },
                          1000 * 60 * 60 * 24,
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'potentialDuplicates',
          })
          .addFields({
            potentialDuplicates: {
              $map: {
                input: '$potentialDuplicates',
                as: 'duplicate',
                in: '$$duplicate._id',
              },
            },
          })
          .sort({
            issuedAt: -1,
          })
          .session(session);

        return model.populate<Documents.DraftTransaction>(transactions, {
          path: 'potentialDuplicates',
          model: model,
          populate: populateTransaction,
        });
      });
    },
  };

  return instance;
};
