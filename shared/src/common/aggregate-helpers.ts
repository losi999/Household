import { Account } from '@household/shared/types/types';
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

export const duplicateByAccounts = (accountType?: Account.AccountType['accountType']): [PipelineStage.Set, PipelineStage.Unwind, PipelineStage.ReplaceRoot] => [
  {
    $set: {
      tmp_dupes: {
        $filter: {
          input: [
            {
              tmp_account: {
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
              tmp_account: '$transferAccount',
              amount: '$transferAmount',
            },
            {
              tmp_account: '$ownerAccount',
              amount: {
                $cond: {
                  if: {
                    $eq: [
                      accountType ?? '$$accountType',
                      'loan',
                    ],
                  },
                  then: {
                    $multiply: [
                      '$amount',
                      -1,
                    ],
                  },
                  else: '$amount',
                },
              },
            },
            {
              tmp_account: '$payingAccount',
              amount: '$amount',
            },
          ],
          cond: {
            $ne: [
              {
                $ifNull: [
                  '$$this.tmp_account',
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
                        'loan',
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
                          'loan',
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
                          'loan',
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

export const rebuildSplits = (): [PipelineStage.Group, PipelineStage.ReplaceRoot, PipelineStage.Set, PipelineStage.Unset] => [
  {
    $group: {
      _id: '$tx_id',
      tmp_splits: {
        $push: '$$ROOT',
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          '$$ROOT',
          {
            $arrayElemAt: [
              '$tmp_splits',
              0,
            ],
          },
        ],
      },
    },
  },
  {
    $set: {
      _id: '$tx_id',
      transactionType: '$tx_transactionType',
      description: '$tx_description',
      amount: '$tx_amount',
      payingAccount: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$payingAccount',
        ],
      },
      isSettled: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$isSettled',
        ],
      },
      ownerAccount: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$ownerAccount',
        ],
      },
      category: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$category',
        ],
      },
      project: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$project',
        ],
      },
      quantity: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$quantity',
        ],
      },
      product: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$product',
        ],
      },
      invoiceNumber: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$invoiceNumber',
        ],
      },
      billingStartDate: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$billingStartDate',
        ],
      },
      billingEndDate: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$billingEndDate',
        ],
      },
      remainingAmount: {
        $cond: [
          {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$remainingAmount',
        ],
      },
      splits: {
        $cond: {
          if: {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          then: {
            $map: {
              input: {
                $filter: {
                  input: '$tmp_splits',
                  cond: {
                    $ne: [
                      '$$this.transactionType',
                      'deferred',
                    ],
                  },
                },
              },
              in: {
                _id: '$$this._id',
                amount: '$$this.amount',
                description: {
                  $cond: {
                    if: {
                      $ne: [
                        '$$this.description',
                        null,
                      ],
                    },
                    then: '$$this.description',
                    else: '$$REMOVE',
                  },
                },
                category: '$$this.category',
                project: '$$this.project',
                quantity: '$$this.quantity',
                product: '$$this.product',
                invoiceNumber: '$$this.invoiceNumber',
                billingStartDate: '$$this.billingStartDate',
                billingEndDate: '$$this.billingEndDate',
              },
            },
          },
          else: '$$REMOVE',
        },
      },
      deferredSplits: {
        $cond: {
          if: {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          then: {
            $map: {
              input: {
                $filter: {
                  input: '$tmp_splits',
                  cond: {
                    $eq: [
                      '$$this.transactionType',
                      'deferred',
                    ],
                  },
                },
              },
              in: {
                _id: '$$this._id',
                transactionType: '$$this.transactionType',
                payingAccount: '$$this.payingAccount',
                ownerAccount: '$$this.ownerAccount',
                remainingAmount: '$$this.remainingAmount',
                isSettled: '$$this.isSettled',
                amount: '$$this.amount',
                description: {
                  $cond: {
                    if: {
                      $ne: [
                        '$$this.description',
                        null,
                      ],
                    },
                    then: '$$this.description',
                    else: '$$REMOVE',
                  },
                },
                category: '$$this.category',
                project: '$$this.project',
                quantity: '$$this.quantity',
                product: '$$this.product',
                invoiceNumber: '$$this.invoiceNumber',
                billingStartDate: '$$this.billingStartDate',
                billingEndDate: '$$this.billingEndDate',
              },
            },
          },
          else: '$$REMOVE',
        },
      },
    },

  },
  {
    $unset: [
      'tx_amount',
      'tx_description',
      'tmp_splits',
      'tx_id',
      'tx_transactionType',
    ],
  },
];

export const calculateRemainingAmount = (): [PipelineStage.Lookup, PipelineStage.Set] => [
  {
    $lookup: {
      from: 'transactions',
      let: {
        transactionId: '$_id',
      },
      pipeline: [
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
              '$transactionType',
              'deferred',
            ],
          },
          then: {
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
          else: '$$REMOVE',
        },
      },
    },
  },
];
