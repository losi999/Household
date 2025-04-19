import { AccountType } from '@household/shared/enums';
import { PipelineStage } from 'mongoose';

export const populateAggregate = (localField: string, from: string, pipeline?: PipelineStage.Lookup['$lookup']['pipeline']): [PipelineStage.Lookup, PipelineStage.Unwind] => [
  {
    $lookup: {
      from,
      localField,
      foreignField: '_id',
      as: localField,
      ...(pipeline ? {
        pipeline,
      } : {}),
    },
  },
  {
    $unwind: {
      path: `$${localField}`,
      preserveNullAndEmptyArrays: true,
    },
  },
];

export const flattenSplit = (additionalPropeties: Record<string, any>): [PipelineStage.Set, PipelineStage.Unwind, PipelineStage.ReplaceRoot] => [
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
          additionalPropeties,
        ],
      },
    },
  },
];

export const calculateAccountBalances = (): [PipelineStage.Lookup, PipelineStage.Set, PipelineStage.Unset] => [
  {
    $lookup: {
      from: 'transactions',
      let: {
        accountId: '$_id',
        accountType: '$accountType',
      },
      as: 'transactions',
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: [
                    '$$accountId',
                    '$account',
                  ],
                },
                {
                  $eq: [
                    '$$accountId',
                    '$transferAccount',
                  ],
                },
                {
                  $eq: [
                    '$$accountId',
                    '$payingAccount',
                  ],
                },
                {
                  $and: [
                    {
                      $eq: [
                        '$$accountType',
                        AccountType.Loan,
                      ],
                    },
                    {
                      $or: [
                        {
                          $eq: [
                            '$$accountId',
                            '$ownerAccount',
                          ],
                        },
                        {
                          $in: [
                            '$$accountId',
                            {
                              $map: {
                                input: {
                                  $ifNull: [
                                    '$deferredSplits',
                                    [],
                                  ],
                                },
                                as: 'split',
                                in: '$$split.ownerAccount',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  },
  {
    $set: {
      balance: {
        $reduce: {
          input: '$transactions',
          initialValue: 0,
          in: {
            $add: [
              '$$value',
              {
                $cond: {
                  if: {
                    $in: [
                      '$_id',
                      [
                        '$$this.account',
                        '$$this.payingAccount',
                      ],
                    ],
                  },
                  then: '$$this.amount',
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $eq: [
                      '$$this.transferAccount',
                      '$_id',
                    ],
                  },
                  then: '$$this.transferAmount',
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$accountType',
                          AccountType.Loan,
                        ],
                      },
                      {
                        $eq: [
                          '$$this.ownerAccount',
                          '$_id',
                        ],
                      },
                    ],
                  },
                  then: {
                    $multiply: [
                      -1,
                      '$$this.amount',
                    ],
                  },
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$accountType',
                          AccountType.Loan,
                        ],
                      },
                      {
                        $ne: [
                          {
                            $type: '$$this.deferredSplits',
                          },
                          'missing',
                        ],
                      },
                    ],
                  },
                  then: {
                    $sum: {
                      $map: {
                        input: '$$this.deferredSplits',
                        as: 'split',
                        in: {
                          $cond: {
                            if: {
                              $eq: [
                                '$$split.ownerAccount',
                                '$_id',
                              ],
                            },
                            then: {
                              $multiply: [
                                -1,
                                '$$split.amount',
                              ],
                            },
                            else: 0,
                          },
                        },
                      },
                    },
                  },
                  else: 0,
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unset: ['transactions'],
  },
];
