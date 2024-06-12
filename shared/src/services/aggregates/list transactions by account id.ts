import { PipelineStage, Types } from 'mongoose';

export const listTransactionsByAccountId = (accountId: string): PipelineStage[] => [
  {
    $unwind: {
      path: '$splits',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          '$$ROOT',
          '$splits',
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
    $set: {
      tmp_dupes: {
        $filter: {
          input: [
            {
              tmp_account: '$accounts.mainAccount',
            },
            {
              tmp_account: '$accounts.transferAccount',
              amount: {
                $ifNull: [
                  '$transferAmount',
                  '$amount',
                ],
              },
            },
            {
              tmp_account: '$accounts.ownerAccount',
            },
            {
              tmp_account: '$accounts.payingAccount',
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
  {
    $unset: [
      'tmp_dupes',
      'splits',
    ],
  },
  {
    $match: {
      tmp_account: new Types.ObjectId(accountId),
    },
  },
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
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      '$tmp_account',
                      '$accounts.ownerAccount',
                    ],
                  },
                  then: {
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
                {
                  case: {
                    $eq: [
                      '$tmp_account',
                      '$accounts.payingAccount',
                    ],
                  },
                  then: {
                    $sum: [
                      '$amount',
                      {
                        $sum: '$tmp_deferredTransactions.payments.amount',
                      },
                    ],
                  },
                },
              ],
              default: '$$REMOVE',
            },
          },
          else: '$$REMOVE',
        },
      },
    },
  },
  {
    $unset: [
      'tmp_deferredTransactions',
      'tmp_account',
    ],
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'accounts.mainAccount',
      foreignField: '_id',
      as: 'accounts.mainAccount',
    },
  },
  {
    $unwind: {
      path: '$accounts.mainAccount',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'accounts.payingAccount',
      foreignField: '_id',
      as: 'accounts.payingAccount',
    },
  },
  {
    $unwind: {
      path: '$accounts.payingAccount',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'accounts.ownerAccount',
      foreignField: '_id',
      as: 'accounts.ownerAccount',
    },
  },
  {
    $unwind: {
      path: '$accounts.ownerAccount',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'accounts.transferAccount',
      foreignField: '_id',
      as: 'accounts.transferAccount',
    },
  },
  {
    $unwind: {
      path: '$accounts.transferAccount',
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
      accounts: {
        $cond: {
          if: {
            $eq: [
              '$tx_transactionType',
              'split',
            ],
          },
          then: {
            mainAccount: {
              $ifNull: [
                '$accounts.mainAccount',
                '$accounts.payingAccount',
              ],
            },
          },
          else: '$accounts',
        },
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
              input: '$tmp_splits',
              in: {
                _id: {
                  $cond: [
                    {
                      $eq: [
                        '$$this.transactionType',
                        'deferred',
                      ],
                    },
                    '$$this._id',
                    '$$REMOVE',
                  ],
                },
                transactionType: {
                  $cond: [
                    {
                      $eq: [
                        '$$this.transactionType',
                        'deferred',
                      ],
                    },
                    '$$this.transactionType',
                    '$$REMOVE',
                  ],
                },
                accounts: {
                  $cond: [
                    {
                      $eq: [
                        '$$this.transactionType',
                        'deferred',
                      ],
                    },
                    '$$this.accounts',
                    '$$REMOVE',
                  ],
                },
                remainingAmount: {
                  $cond: [
                    {
                      $eq: [
                        '$$this.transactionType',
                        'deferred',
                      ],
                    },
                    '$$this.remainingAmount',
                    '$$REMOVE',
                  ],
                },
                amount: '$$this.amount',
                description: '$$this.description',
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
  {
    $sort: {
      issuedAt: -1,
    },
  },
];

