import { flattenSplit, duplicateByAccounts, calculateRemainingAmount, rebuildSplits, populateAggregate } from '@household/shared/common/aggregate-helpers';
import { populate } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Restrict } from '@household/shared/types/common';
import { Account, Common, Transaction } from '@household/shared/types/types';
import { PipelineStage, Types, UpdateQuery } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(transactionId: Transaction.Id, updateQuery: UpdateQuery<Transaction.Document>): Promise<unknown>;
  replaceTransaction(transactionId: Transaction.Id, doc: Restrict<Transaction.Document, '_id'>): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Transaction.RawReport[]>;
  listDeferredTransactions(ctx?: {
    deferredTransactionIds?: Transaction.Id[];
    excludedTransferTransactionId?: Transaction.Id
  }): Promise<Transaction.DeferredDocument[]>;
  listTransactionsByAccountId(data: Account.AccountId & Common.Pagination<number>): Promise<Transaction.Document[]>;
}

export const transactionServiceFactory = (mongodbService: IMongodbService): ITransactionService => {

  const instance: ITransactionService = {
    dumpTransactions: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.find({})
          .setOptions({
            session,
            lean: true,
          })
          .exec();
      });
    },
    saveTransaction: (doc) => {
      return mongodbService.transactions.create(doc);
    },
    saveTransactions: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.transactions.insertMany(docs, {
            session,
          });
        });
      });
    },
    getTransactionById: (transactionId) => {
      return !transactionId ? undefined : mongodbService.transactions.findById(transactionId)
        .setOptions({
          populate: populate('project',
            'recipient',
            'account',
            'transferAccount',
            'payingAccount',
            'ownerAccount',
            'category',
            'product',
            'splits.category',
            'splits.project',
            'splits.product',
            'deferredSplits.payingAccount',
            'deferredSplits.ownerAccount',
            'deferredSplits.category',
            'deferredSplits.project',
            'deferredSplits.product',
            'payments.transaction'),
          lean: true,
        })
        .exec();
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      return !transactionId ? undefined : (await mongodbService.transactions.aggregate<Transaction.Document>(
        [
          {
            $match: {
              _id: new Types.ObjectId(transactionId),
            },
          },
          ...flattenSplit({
            tx_amount: '$amount',
            tx_description: '$description',
            tx_id: '$_id',
            tx_transactionType: '$transactionType',
          }),
          ...duplicateByAccounts(),
          {
            $unset: [
              'tmp_dupes',
              'tmp_splits',
              'splits',
              'deferredSplits',
            ],
          },
          {
            $match: {
              tmp_account: new Types.ObjectId(accountId),
            },
          },
          ...calculateRemainingAmount(),
          {
            $unset: [
              'tmp_deferredTransactions',
              'tmp_account',
            ],
          },
          ...populateAggregate('account', 'accounts'),
          ...populateAggregate('payingAccount', 'accounts'),
          ...populateAggregate('ownerAccount', 'accounts'),
          ...populateAggregate('transferAccount', 'accounts'),
          ...populateAggregate('category', 'categories'),
          ...populateAggregate('project', 'projects'),
          ...populateAggregate('product', 'products'),
          ...populateAggregate('recipient', 'recipients'),
          ...rebuildSplits(),
        ],
      ))[0];
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions.deleteOne({
        _id: transactionId,
      })
        .exec();
    },
    updateTransaction: async (transactionId, updateQuery) => {
      return mongodbService.transactions.findOneAndUpdate({
        _id: new Types.ObjectId(transactionId),
        transactionType: updateQuery.$set.transactionType,
      }, updateQuery, {
        runValidators: true,
      });
    },
    replaceTransaction: (transactionId, doc) => {
      return mongodbService.transactions.findOneAndReplace({
        _id: new Types.ObjectId(transactionId),
      }, doc, {
        runValidators: true,
        overwriteDiscriminatorKey: true,
      })
        .exec();
    },
    listTransactions: (match) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate(
          [
            {
              $match: {
                transactionType: {
                  $nin: [
                    'transfer',
                    'loanTransfer',
                  ],
                },
              },
            },
            ...flattenSplit({
              _id: '$_id',
              splitId: '$tmp_splits._id',
            }),
            {
              $set: {
                tmp_dupes: {
                  $filter: {
                    input: [
                      {
                        account: {
                          $cond: {
                            if: {
                              $ne: [
                                '$transactionType',
                                'deferred',
                              ],
                            },
                            then: '$account',
                            else: null,
                          },
                        },
                      },
                      {
                        account: '$transferAccount',
                        amount: {
                          $ifNull: [
                            '$transferAmount',
                            '$amount',
                          ],
                        },
                      },
                      {
                        account: '$ownerAccount',
                      },
                    ],
                    cond: {
                      $ne: [
                        {
                          $ifNull: [
                            '$$this.account',
                            null,
                          ],
                        },
                        null,
                      ],
                    },
                  },
                },
              },
            },
            {
              $unwind: {
                path: '$tmp_dupes',
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    '$$ROOT',
                    '$tmp_dupes',
                  ],
                },
              },
            },
            {
              $unset: [
                'tmp_dupes',
                'tmp_splits',
                'splits',
                'deferredSplits',
                'payingAccount',
                'ownerAccount',
                'isSettled',
                'transactionType',
              ],
            },
            match,
            ...populateAggregate('account', 'accounts'),
            ...populateAggregate('category', 'categories'),
            ...populateAggregate('project', 'projects'),
            ...populateAggregate('product', 'products'),
            ...populateAggregate('recipient', 'recipients'),
          ], {
            session,
          });

      });
    },
    listDeferredTransactions: ({ deferredTransactionIds, excludedTransferTransactionId } = {}) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate<Transaction.DeferredDocument>(
          [
            ...flattenSplit({
              tx_amount: '$amount',
              tx_description: '$description',
              tx_id: '$_id',
              tx_transactionType: '$transactionType',
            }),
            {
              $match: {
                ...(deferredTransactionIds?.length > 0 ? {
                  _id: {
                    $in: deferredTransactionIds.map(id => new Types.ObjectId(id)),
                  },
                } : {}),
                transactionType: 'deferred',
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
                ],
                as: 'tmp_deferredTransactions',
              },
            },
            {
              $set: {
                remainingAmount: {
                  $cond: {
                    if: {
                      $eq: [
                        '$isSettled',
                        true,
                      ],
                    },
                    then: 0,
                    else: {
                      $multiply: [
                        {
                          $sum: [
                            '$amount',
                            {
                              $sum: '$tmp_deferredTransactions.payments.amount',
                            },
                          ],
                        },
                        -1,
                      ],
                    },
                  },

                },
              },
            },
            {
              $unset: [
                'tmp_deferredTransactions',
                'deferredSplits',
                'account',
                'splits',
                'tx_amount',
                'tx_description',
                'tx_id',
                'tx_transactionType',
                'tmp_splits',
              ],
            },
            ...populateAggregate('payingAccount', 'accounts'),
            ...populateAggregate('ownerAccount', 'accounts'),
            ...populateAggregate('category', 'categories'),
            ...populateAggregate('project', 'projects'),
            ...populateAggregate('product', 'products'),
            ...populateAggregate('recipient', 'recipients'),
          ], {
            session,
          });
      });
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.inSession(async (session) => {
        return mongodbService.transactions.aggregate([
          ...flattenSplit({
            tx_amount: '$amount',
            tx_description: '$description',
            tx_id: '$_id',
            tx_transactionType: '$transactionType',
          }),
          ...duplicateByAccounts(),
          {
            $unset: [
              'tmp_dupes',
              'tmp_splits',
              'splits',
              'deferredSplits',
            ],
          },
          {
            $match: {
              tmp_account: new Types.ObjectId(accountId),
            },
          },
          ...calculateRemainingAmount(),
          {
            $unset: [
              'tmp_deferredTransactions',
              'tmp_account',
            ],
          },
          ...populateAggregate('account', 'accounts'),
          ...populateAggregate('payingAccount', 'accounts'),
          ...populateAggregate('ownerAccount', 'accounts'),
          ...populateAggregate('transferAccount', 'accounts'),
          ...populateAggregate('category', 'categories'),
          ...populateAggregate('project', 'projects'),
          ...populateAggregate('product', 'products'),
          ...populateAggregate('recipient', 'recipients'),
          ...rebuildSplits(),
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
        ], {
          session,
        });
      });
    },
  };

  return instance;
};
