import { Account, Transaction } from '@household/shared/types/types';
import { PipelineStage, Types } from 'mongoose';

export const listDeferredTransactions = (ctx: {
  payingAccountIds?: Account.Id[];
  deferredTransactionIds?: Transaction.Id[];
  excludedTransferTransactionId?: Transaction.Id
}): PipelineStage[] => [
  {
    $set: {
      tmp_splits: {
        $concatArrays: [
          '$splits',
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
            tx_amount: '$amount',
            tx_description: '$description',
            tx_id: '$_id',
            tx_transactionType: '$transactionType',
          },
        ],
      },
    },
  },
  {
    $match: {
      ...(ctx.payingAccountIds.length > 0 ? {
        'accounts.payingAccount': {
          $in: ctx.payingAccountIds.map(id => new Types.ObjectId(id)),
        },
      } : {}),
      ...(ctx.deferredTransactionIds.length > 0 ? {
        _id: {
          $in: ctx.deferredTransactionIds.map(id => new Types.ObjectId(id)),
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
        ...(ctx.excludedTransferTransactionId ? [
          {
            $match: {
              _id: {
                $ne: new Types.ObjectId(ctx.excludedTransferTransactionId),
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
        $add: [
          '$amount',
          {
            $sum: '$tmp_deferredTransactions.payments.amount',
          },
        ],
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
  {
    $lookup: {
      from: 'accounts',
      localField: 'payingAccount',
      foreignField: '_id',
      as: 'payingAccount',
    },
  },
  {
    $unwind: {
      path: '$payingAccount',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'ownerAccount',
      foreignField: '_id',
      as: 'ownerAccount',
    },
  },
  {
    $unwind: {
      path: '$ownerAccount',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category',
    },
  },
  {
    $unwind: {
      path: '$category',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'projects',
      localField: 'project',
      foreignField: '_id',
      as: 'project',
    },
  },
  {
    $unwind: {
      path: '$project',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'products',
      localField: 'product',
      foreignField: '_id',
      as: 'product',
    },
  },
  {
    $unwind: {
      path: '$product',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'recipients',
      localField: 'recipient',
      foreignField: '_id',
      as: 'recipient',
    },
  },
  {
    $unwind: {
      path: '$recipient',
      preserveNullAndEmptyArrays: true,
    },
  },
];
