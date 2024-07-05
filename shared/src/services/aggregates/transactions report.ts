import { PipelineStage } from 'mongoose';

export const transactionsReport = (match: PipelineStage.Match): PipelineStage[] => [
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
            splitId: '$tmp_splits._id',
          },
        ],
      },
    },
  },
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
    ],
  },
  match,
  {
    $lookup: {
      from: 'accounts',
      localField: 'account',
      foreignField: '_id',
      as: 'account',
    },
  },
  {
    $unwind: {
      path: '$account',
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
