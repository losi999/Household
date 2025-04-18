import { flattenSplit, populateAggregate } from '@household/shared/common/aggregate-helpers';
import { populate } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
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
            'deferredSplits.product',
            'payments.transaction'),
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
                $and: [
                  {
                    _id: new Types.ObjectId(transactionId),
                  },
                  {
                    $or: [
                      {
                        account: account._id,
                      },
                      {
                        transferAccount: account._id,
                      },
                      {
                        payingAccount: account._id,
                      },
                      {
                        ownerAccount: account._id,
                      },
                      {
                        'deferredSplits.ownerAccount': account._id,
                      },
                    ],
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'transactions',
                let: {
                  transactionId: '$_id',
                  deferredSplits: '$deferredSplits',
                },
                as: 'repayments',
                pipeline: [
                  {
                    $unwind: {
                      path: '$payments',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $or: [
                          {
                            $eq: [
                              '$$transactionId',
                              '$payments.transaction',
                            ],
                          },
                          {
                            $in: [
                              '$payments.transaction',
                              {
                                $map: {
                                  input: {
                                    $ifNull: [
                                      '$$deferredSplits',
                                      [],
                                    ],
                                  },
                                  as: 'split',
                                  in: '$$split._id',
                                },
                              },
                            ],
                          },
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
              },
            },
            ...populateAggregate('account', 'accounts'),
            {
              $lookup: {
                from: 'projects',
                localField: 'deferredSplits.project',
                foreignField: '_id',
                as: 'projects',
              },
            },
            {
              $lookup: {
                from: 'products',
                localField: 'deferredSplits.product',
                foreignField: '_id',
                as: 'products',
              },
            },
            {
              $lookup: {
                from: 'accounts',
                localField: 'deferredSplits.ownerAccount',
                foreignField: '_id',
                as: 'accounts',
              },
            },
            {
              $lookup: {
                from: 'categories',
                let: {
                  categoryIds: {
                    $map: {
                      input: '$deferredSplits',
                      as: 'split',
                      in: '$$split.category',
                    },
                  },
                },
                as: 'categories',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [
                          '$_id',
                          {
                            $ifNull: [
                              '$$categoryIds',
                              [],
                            ],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: 'categories',
                      localField: 'ancestors',
                      foreignField: '_id',
                      as: 'ancestors',
                    },
                  },
                ],
              },
            },
            {
              $set: {
                remainingAmount: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $eq: [
                            '$transactionType',
                            'deferred',
                          ],
                        },
                        {
                          $eq: [
                            '$isSettled',
                            false,
                          ],
                        },
                      ],
                    },
                    then: {
                      $subtract: [
                        {
                          $abs: '$amount',
                        },
                        {
                          $sum: '$repayments.amount',
                        },
                      ],

                    },
                    else: '$$REMOVE',
                  },
                },
                deferredSplits: {
                  $cond: {
                    if: {
                      $ne: [
                        {
                          $type: '$deferredSplits',
                        },
                        'missing',
                      ],
                    },
                    then: {
                      $map: {
                        input: '$deferredSplits',
                        as: 'split',
                        in: {
                          $mergeObjects: [
                            '$$split',
                            {
                              remainingAmount: {
                                $cond: {
                                  if: {
                                    $eq: [
                                      '$$split.isSettled',
                                      false,
                                    ],
                                  },
                                  then: {
                                    $subtract: [
                                      {
                                        $abs: '$$split.amount',
                                      },
                                      {
                                        $sum: {
                                          $map: {
                                            input: '$repayments',
                                            as: 'payment',
                                            in: {
                                              $cond: {
                                                if: {
                                                  $eq: [
                                                    '$$payment.transaction',
                                                    '$$split._id',
                                                  ],
                                                },
                                                then: '$$payment.amount',
                                                else: 0,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  else: '$$REMOVE',
                                },
                              },
                              payingAccount: '$account',
                              ownerAccount: {
                                $first: {
                                  $filter: {
                                    input: '$accounts',
                                    as: 'a',
                                    cond: {
                                      $eq: [
                                        '$$a._id',
                                        '$$split.ownerAccount',
                                      ],
                                    },
                                  },
                                },
                              },
                              project: {
                                $first: {
                                  $filter: {
                                    input: '$projects',
                                    as: 'p',
                                    cond: {
                                      $eq: [
                                        '$$p._id',
                                        '$$split.project',
                                      ],
                                    },
                                  },
                                },
                              },
                              product: {
                                $first: {
                                  $filter: {
                                    input: '$products',
                                    as: 'p',
                                    cond: {
                                      $eq: [
                                        '$$p._id',
                                        '$$split.product',
                                      ],
                                    },
                                  },
                                },
                              },
                              category: {
                                $first: {
                                  $filter: {
                                    input: '$categories',
                                    as: 'c',
                                    cond: {
                                      $eq: [
                                        '$$c._id',
                                        '$$split.category',
                                      ],
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    else: '$$REMOVE',
                  },
                },
              },
            },
            {
              $unset: ['repayments'],
            },
            {
              $lookup: {
                from: 'projects',
                localField: 'splits.project',
                foreignField: '_id',
                as: 'projects',
              },
            },
            {
              $lookup: {
                from: 'products',
                localField: 'splits.product',
                foreignField: '_id',
                as: 'products',
              },
            },
            {
              $lookup: {
                from: 'categories',
                let: {
                  categoryIds: {
                    $map: {
                      input: '$splits',
                      as: 'split',
                      in: '$$split.category',
                    },
                  },
                },
                as: 'categories',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [
                          '$_id',
                          {
                            $ifNull: [
                              '$$categoryIds',
                              [],
                            ],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: 'categories',
                      localField: 'ancestors',
                      foreignField: '_id',
                      as: 'ancestors',
                    },
                  },
                ],
              },
            },
            {
              $set: {
                splits: {
                  $cond: {
                    if: {
                      $ne: [
                        {
                          $type: '$splits',
                        },
                        'missing',
                      ],
                    },
                    then: {
                      $map: {
                        input: '$splits',
                        as: 'split',
                        in: {
                          $mergeObjects: [
                            '$$split',
                            {
                              project: {
                                $first: {
                                  $filter: {
                                    input: '$projects',
                                    as: 'p',
                                    cond: {
                                      $eq: [
                                        '$$p._id',
                                        '$$split.project',
                                      ],
                                    },
                                  },
                                },
                              },
                              product: {
                                $first: {
                                  $filter: {
                                    input: '$products',
                                    as: 'p',
                                    cond: {
                                      $eq: [
                                        '$$p._id',
                                        '$$split.product',
                                      ],
                                    },
                                  },
                                },
                              },
                              category: {
                                $first: {
                                  $filter: {
                                    input: '$categories',
                                    as: 'c',
                                    cond: {
                                      $eq: [
                                        '$$c._id',
                                        '$$split.category',
                                      ],
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    else: '$$REMOVE',
                  },
                },
              },
            },
            ...populateAggregate('payingAccount', 'accounts'),
            ...populateAggregate('ownerAccount', 'accounts'),
            ...populateAggregate('transferAccount', 'accounts'),
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
              $unset: [
                'projects',
                'categories',
                'products',
                'accounts',
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
              const newDeferredTransactionIds = updateQuery.$set.deferredSplits.map((s: any) => s._id) ;

              deletedDeferredTransactionIds = old.deferredSplits.reduce((accumulator, currentValue) => {
                return newDeferredTransactionIds.includes(currentValue._id) ? accumulator : [
                  ...accumulator,
                  currentValue._id,
                ];
              }, []);

            } else {
              deletedDeferredTransactionIds = old.deferredSplits.map(s => s._id);
            }
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
          {
            $match: {
              remainingAmount: {
                $gt: 0,
              },
            },
          },
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
          {
            $match: {
              $or: [
                {
                  account: account._id,
                },
                {
                  transferAccount: account._id,
                },
                {
                  payingAccount: account._id,
                },
                {
                  ownerAccount: account._id,
                },
                {
                  'deferredSplits.ownerAccount': account._id,
                },
              ],
            },
          },
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
          {
            $lookup: {
              from: 'transactions',
              let: {
                transactionId: '$_id',
                deferredSplits: '$deferredSplits',
              },
              as: 'repayments',
              pipeline: [
                {
                  $unwind: {
                    path: '$payments',
                  },
                },
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: [
                            '$$transactionId',
                            '$payments.transaction',
                          ],
                        },
                        {
                          $in: [
                            '$payments.transaction',
                            {
                              $map: {
                                input: {
                                  $ifNull: [
                                    '$$deferredSplits',
                                    [],
                                  ],
                                },
                                as: 'split',
                                in: '$$split._id',
                              },
                            },
                          ],
                        },
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
            },
          },
          ...populateAggregate('account', 'accounts'),
          {
            $lookup: {
              from: 'projects',
              localField: 'deferredSplits.project',
              foreignField: '_id',
              as: 'projects',
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: 'deferredSplits.product',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'deferredSplits.ownerAccount',
              foreignField: '_id',
              as: 'accounts',
            },
          },
          {
            $lookup: {
              from: 'categories',
              let: {
                categoryIds: {
                  $map: {
                    input: '$deferredSplits',
                    as: 'split',
                    in: '$$split.category',
                  },
                },
              },
              as: 'categories',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        '$_id',
                        {
                          $ifNull: [
                            '$$categoryIds',
                            [],
                          ],
                        },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'categories',
                    localField: 'ancestors',
                    foreignField: '_id',
                    as: 'ancestors',
                  },
                },
              ],
            },
          },
          {
            $set: {
              amount: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          account.accountType,
                          AccountType.Loan,
                        ],
                      },
                      {
                        $eq: [
                          '$transactionType',
                          'deferred',
                        ],
                      },
                    ],
                  },
                  then: {
                    $multiply: [
                      -1,
                      '$amount',
                    ],
                  },
                  else: '$amount',
                },
              },
              splits: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$transactionType',
                          'split',
                        ],
                      },
                      {
                        $ne: [
                          '$account',
                          account._id,
                        ],
                      },
                    ],
                  },
                  then: [],
                  else: '$splits',
                },
              },
              remainingAmount: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$transactionType',
                          'deferred',
                        ],
                      },
                      {
                        $eq: [
                          '$isSettled',
                          false,
                        ],
                      },
                    ],
                  },
                  then: {
                    $subtract: [
                      {
                        $abs: '$amount',
                      },
                      {
                        $sum: '$repayments.amount',
                      },
                    ],

                  },
                  else: '$$REMOVE',
                },
              },
              deferredSplits: {
                $cond: {
                  if: {
                    $ne: [
                      {
                        $type: '$deferredSplits',
                      },
                      'missing',
                    ],
                  },
                  then: {
                    $map: {
                      input: '$deferredSplits',
                      as: 'split',
                      in: {
                        $mergeObjects: [
                          '$$split',
                          {
                            remainingAmount: {
                              $cond: {
                                if: {
                                  $eq: [
                                    '$$split.isSettled',
                                    false,
                                  ],
                                },
                                then: {
                                  $subtract: [
                                    {
                                      $abs: '$$split.amount',
                                    },
                                    {
                                      $sum: {
                                        $map: {
                                          input: '$repayments',
                                          as: 'payment',
                                          in: {
                                            $cond: {
                                              if: {
                                                $eq: [
                                                  '$$payment.transaction',
                                                  '$$split._id',
                                                ],
                                              },
                                              then: '$$payment.amount',
                                              else: 0,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  ],
                                },
                                else: '$$REMOVE',
                              },
                            },
                            payingAccount: '$account',
                            ownerAccount: {
                              $first: {
                                $filter: {
                                  input: '$accounts',
                                  as: 'a',
                                  cond: {
                                    $eq: [
                                      '$$a._id',
                                      '$$split.ownerAccount',
                                    ],
                                  },
                                },
                              },
                            },
                            project: {
                              $first: {
                                $filter: {
                                  input: '$projects',
                                  as: 'p',
                                  cond: {
                                    $eq: [
                                      '$$p._id',
                                      '$$split.project',
                                    ],
                                  },
                                },
                              },
                            },
                            product: {
                              $first: {
                                $filter: {
                                  input: '$products',
                                  as: 'p',
                                  cond: {
                                    $eq: [
                                      '$$p._id',
                                      '$$split.product',
                                    ],
                                  },
                                },
                              },
                            },
                            category: {
                              $first: {
                                $filter: {
                                  input: '$categories',
                                  as: 'c',
                                  cond: {
                                    $eq: [
                                      '$$c._id',
                                      '$$split.category',
                                    ],
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  else: '$$REMOVE',
                },
              },
            },
          },
          {
            $unset: ['repayments'],
          },
          {
            $lookup: {
              from: 'projects',
              localField: 'splits.project',
              foreignField: '_id',
              as: 'projects',
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: 'splits.product',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $lookup: {
              from: 'categories',
              let: {
                categoryIds: {
                  $map: {
                    input: '$splits',
                    as: 'split',
                    in: '$$split.category',
                  },
                },
              },
              as: 'categories',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        '$_id',
                        {
                          $ifNull: [
                            '$$categoryIds',
                            [],
                          ],
                        },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'categories',
                    localField: 'ancestors',
                    foreignField: '_id',
                    as: 'ancestors',
                  },
                },
              ],
            },
          },
          {
            $set: {
              splits: {
                $cond: {
                  if: {
                    $ne: [
                      {
                        $type: '$splits',
                      },
                      'missing',
                    ],
                  },
                  then: {
                    $map: {
                      input: '$splits',
                      as: 'split',
                      in: {
                        $mergeObjects: [
                          '$$split',
                          {
                            project: {
                              $first: {
                                $filter: {
                                  input: '$projects',
                                  as: 'p',
                                  cond: {
                                    $eq: [
                                      '$$p._id',
                                      '$$split.project',
                                    ],
                                  },
                                },
                              },
                            },
                            product: {
                              $first: {
                                $filter: {
                                  input: '$products',
                                  as: 'p',
                                  cond: {
                                    $eq: [
                                      '$$p._id',
                                      '$$split.product',
                                    ],
                                  },
                                },
                              },
                            },
                            category: {
                              $first: {
                                $filter: {
                                  input: '$categories',
                                  as: 'c',
                                  cond: {
                                    $eq: [
                                      '$$c._id',
                                      '$$split.category',
                                    ],
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  else: '$$REMOVE',
                },
              },
            },
          },
          ...populateAggregate('payingAccount', 'accounts'),
          ...populateAggregate('ownerAccount', 'accounts'),
          ...populateAggregate('transferAccount', 'accounts'),
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
            $unset: [
              'projects',
              'categories',
              'products',
              'accounts',
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
              draftDate: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$issuedAt',
                },
              },
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
                        $eq: [
                          {
                            $dateToString: {
                              format: '%Y-%m-%d',
                              date: '$issuedAt',
                            },
                          },
                          '$$draftDate',
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
          .session(session)
          .exec();
      });
    },
  };

  return instance;
};
