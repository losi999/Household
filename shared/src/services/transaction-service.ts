import { calculateRemainingAmount, collectRelatedIds, concatenateSplits, flattenSplit, lookup, matchAnyProperty, populateAggregate, populateRelatedObjects } from '@household/shared/common/aggregate-helpers';
import { populate } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Common, File, Transaction } from '@household/shared/types/types';
import { PipelineStage, Types, UpdateQuery } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(transactionId: Transaction.Id, updateQuery: UpdateQuery<Transaction.Document>): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Transaction.RawReport[]>;
  listDeferredTransactions(ctx?: {
    deferredTransactionIds?: Transaction.Id[];
    excludedTransferTransactionId?: Transaction.Id
  }): Promise<Transaction.DeferredDocument[]>;
  listDraftTransactionsByFileId(fileId: File.Id): Promise<Transaction.DraftDocument[]>;
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
        })
        .exec();
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      if (!transactionId) {
        return undefined;
      }

      return mongodbService.inSession(async (session) => {
        const account = await mongodbService.accounts.findById(accountId).session(session);

        if (!account) {
          return undefined;
        }

        return (await mongodbService.transactions.aggregate<Transaction.Document>(
          [
            {
              $match: {
                _id: new Types.ObjectId(transactionId),
              },
            },
            matchAnyProperty(account._id, [
              'account',
              'transferAccount',
              'payingAccount',
              'ownerAccount',
              'deferredSplits.ownerAccount',
            ]),
            ...calculateRemainingAmount,
            ...populateAggregate('recipient', 'recipients'), 
            concatenateSplits,
            collectRelatedIds,
            lookup('projects', 'allProjects'),
            lookup('products', 'allProducts'),
            lookup('categories', 'allCategories', [
              {
                $lookup: {
                  from: 'categories',
                  localField: 'ancestors',
                  foreignField: '_id',
                  as: 'ancestors',
                },
              },
            ]),
            lookup('accounts', 'allAccounts'),
            populateRelatedObjects,
            {
              $unset: [
                'allAccounts',
                'allProjects',
                'allProducts',
                'allCategories',
                'allSplits',
                'repayments',
              ],
            },
          ],
        ))[0];
      });

    },
    deleteTransaction: (transactionId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async() => {
          const deleted = await mongodbService.transactions.findByIdAndDelete({
            _id: transactionId,
          }, {
            session,

          });

          let deletedDeferredTransactionIds: Types.ObjectId[];

          if (deleted.transactionType === 'deferred') {
            deletedDeferredTransactionIds = [deleted._id];
          }

          if (deleted.transactionType === 'split' && deleted.deferredSplits?.length > 0) {
            deletedDeferredTransactionIds = deleted.deferredSplits.map(s => s._id);
          }

          if (deletedDeferredTransactionIds) {
            await mongodbService.transactions.updateMany({
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
      });

    },
    updateTransaction: async (transactionId, updateQuery) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const old = await mongodbService.transactions.findByIdAndUpdate(transactionId, updateQuery, {
            session,
            returnOriginal: true,
            runValidators: true,
          });

          const previousTransactionType = old.transactionType;
          const currentTransactionType = updateQuery.$set.transactionType;
          let deletedDeferredTransactionIds: Types.ObjectId[];

          if (previousTransactionType === 'deferred' && currentTransactionType !== 'deferred') {
            deletedDeferredTransactionIds = [old._id];
          }

          if (previousTransactionType === 'split' && old.deferredSplits?.length > 0) {
            if (currentTransactionType === 'split' && updateQuery.$set.deferredSplits?.length > 0) {
              const newDeferredTransactionIds = updateQuery.$set.deferredSplits.map((s: any) => s._id?.toString()) ;

              deletedDeferredTransactionIds = old.deferredSplits.reduce((accumulator, currentValue) => {
                return newDeferredTransactionIds.includes(currentValue._id.toString()) ? accumulator : [
                  ...accumulator,
                  currentValue._id,
                ];
              }, []);

            } else {
              deletedDeferredTransactionIds = old.deferredSplits.map(s => s._id);
            }
          }

          if (deletedDeferredTransactionIds?.length > 0) {
            await mongodbService.transactions.updateMany({
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
      });
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
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate<Transaction.DeferredDocument>([
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
      return mongodbService.inSession(async (session) => {
        const account = await mongodbService.accounts.findById(accountId).session(session);

        if (!account) {
          return [];
        }

        return mongodbService.transactions.aggregate([
          matchAnyProperty(account._id, [
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
          ...calculateRemainingAmount,
          ...populateAggregate('recipient', 'recipients'), 
          concatenateSplits,
          collectRelatedIds,
          lookup('projects', 'allProjects'),
          lookup('products', 'allProducts'),
          lookup('categories', 'allCategories', [
            {
              $lookup: {
                from: 'categories',
                localField: 'ancestors',
                foreignField: '_id',
                as: 'ancestors',
              },
            },
          ]),
          lookup('accounts', 'allAccounts'),
          populateRelatedObjects,
          {
            $unset: [
              'allAccounts',
              'allProjects',
              'allProducts',
              'allCategories',
              'allSplits',
              'repayments',
            ],
          },
        ], {
          session,
        });
      });
    },
    listDraftTransactionsByFileId: (fileId) => {
      return mongodbService.inSession(async (session) => {
        return mongodbService.transactions.aggregate()
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
              {
                $limit: 1,
              },
            ],
            as: 'potentialDuplicates',
          })
          .addFields({
            hasDuplicate: {
              $gt: [
                {
                  $size: '$potentialDuplicates',
                },
                0,
              ],
            },
          })
          .project({
            potentialDuplicates: 0,
          })
          .sort({
            issuedAt: -1,
          })
          .session(session)
          .exec();
      });
    },
  };

  return instance;
};
