import { matchAnyProperty, populateAggregate, transactionAggregate } from '@household/shared/common/aggregate-helpers';
import { populate } from '@household/shared/common/utils';
import { TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { PipelineStage, Types } from 'mongoose';
import { Documents } from '@household/shared/types/documents';

export interface ITransactionService {
  saveTransaction(doc: Documents.Transaction): Promise<Documents.Transaction>;
  saveTransactions(...docs: Documents.Transaction[]): Promise<any>;
  findTransactionById<T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T>;
  getTransactionById<T extends Documents.Transaction = Documents.Transaction>(transactionId: Api.Transaction.Id): Promise<T>;
  getTransactionByIdAndAccountId(query: Api.Transaction.TransactionId & Api.Account.AccountId): Promise<Documents.Transaction>;
  deleteTransaction(transactionId: Api.Transaction.Id): Promise<unknown>;
  updateTransaction(transactionId: Api.Transaction.Id, updateQuery: DocumentUpdate<Documents.Transaction>): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Documents.RawTransaction[]>;
  listDeferredTransactions(ctx?: {
    deferredTransactionIds?: Api.Transaction.Id[];
    excludedTransferTransactionId?: Api.Transaction.Id
  }): Promise<Documents.DeferredTransaction[]>;
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
              populate: populate('project',
                'recipient',
                'account',
                'transferAccount',
                'payingAccount',
                'ownerAccount',
                'category',
                'category.ancestors',
                'product',
                'splits.category',
                'splits.project',
                'splits.product',
                'deferredSplits.payingAccount',
                'deferredSplits.ownerAccount',
                'deferredSplits.category',
                'deferredSplits.project',
                'deferredSplits.product'),
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

      const [transaction] = await mongodbService.transactions(async (model, session) => {
        return model.aggregate<Documents.Transaction>(
          [
            {
              $match: {
                _id: new Types.ObjectId(transactionId),
              },
            },
            matchAnyProperty(new Types.ObjectId(accountId), [
              'account',
              'transferAccount',
              'payingAccount',
              'ownerAccount',
              'deferredSplits.ownerAccount',
            ]),
            ...transactionAggregate,
          ],
        ).session(session);
      });
      
      return transaction;
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

        let deletedDeferredTransactionIds: Types.ObjectId[];

        if (deleted.transactionType === TransactionType.Deferred) {
          deletedDeferredTransactionIds = [deleted._id];
        }

        if (deleted.transactionType === TransactionType.Split && deleted.deferredSplits?.length > 0) {
          deletedDeferredTransactionIds = deleted.deferredSplits.map(s => s._id);
        }

        if (deletedDeferredTransactionIds) {
          await models.transactions.updateMany({
            'payments.transaction': {
              $in: deletedDeferredTransactionIds,
            },
          }, {
            $pull: {
              payments: {
                transaction: {
                  $in: deletedDeferredTransactionIds,
                },
              },
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
            ...populateAggregate('product', 'products'),
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
    listDeferredTransactions: ({ deferredTransactionIds, excludedTransferTransactionId } = {}) => {
      return mongodbService.transactions(async (model, session) => {
        return model.aggregate<Documents.DeferredTransaction>([
          {
            $unwind: {
              path: '$deferredSplits',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$$ROOT',
                  '$deferredSplits',
                ],
              },
            },
          },
          {
            $match: {
              ...(deferredTransactionIds?.length > 0 ? {
                _id: {
                  $in: deferredTransactionIds.map(id => new Types.ObjectId(id)),
                },
              } : {}),
              transactionType: 'deferred',
              isSettled: false,
            },
          },
          {
            $lookup: {
              from: 'transactions',
              let: {
                transactionId: '$_id',
              },
              pipeline: [
                ...(excludedTransferTransactionId ? [
                  {
                    $match: {
                      _id: {
                        $ne: new Types.ObjectId(excludedTransferTransactionId),
                      },
                    },
                  },
                ] : []),
                {
                  $unwind: {
                    path: '$payments',
                  },
                },
                {
                  $match: {
                    $expr: {
                      $eq: [
                        '$$transactionId',
                        '$payments.transaction',
                      ],
                    },
                  },
                },
                {
                  $replaceRoot: {
                    newRoot: '$payments',
                  },
                },
              ],
              as: 'repayments',
            },
          },
          {
            $set: {
              remainingAmount: {
                $subtract: [
                  {
                    $abs: '$amount',
                  },
                  {
                    $sum: '$repayments.amount',
                  },
                ],

              },
            },
          },
          {
            $unset: [
              'deferredSplits',
              'splits',
              'repayments',
              'account',
            ],
          },
          ...(deferredTransactionIds?.length > 0 ? [] : [
            {
              $match: {
                remainingAmount: {
                  $gt: 0,
                },
              },
            },
          ]),
          ...populateAggregate('payingAccount', 'accounts'),
          ...populateAggregate('ownerAccount', 'accounts'),
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
          ...populateAggregate('product', 'products'),
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
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.transactions(async (model, session) => {
        return model.aggregate([
          matchAnyProperty(new Types.ObjectId(accountId), [
            'account',
            'transferAccount',
            'payingAccount',
            'ownerAccount',
            'deferredSplits.ownerAccount',
          ]),
          {
            $sort: {
              issuedAt: -1,
            },
          },
          {
            $skip: (pageNumber - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
          ...transactionAggregate,
        ], {
          session,
        });
      });
    },
    listDraftTransactionsByFileId: (fileId) => {
      return mongodbService.transactions(async (model, session) => {
        return model.aggregate()
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
              ...transactionAggregate,
            ],
            as: 'potentialDuplicates',
          })
          .sort({
            issuedAt: -1,
          })
          .session(session);
          
      });
    },
  };

  return instance;
};
