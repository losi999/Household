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
          {
            mainDescription: '$description',
            mainAmount: '$amount',
          },
          '$splits',
        ],
      },
    },
  },
  {
    $set: {
      dupes: {
        $filter: {
          input: [
            {
              _account: '$account',
              _amount: '$amount',
              _description: '$description',
              amount: '$mainAmount',
              description: '$mainDescription',
            },
            {
              _account: '$transferAccount',
              _amount: {
                $ifNull: [
                  '$transferAmount',
                  '$amount',
                ],
              },
              amount: '$mainAmount',
            },
            {
              _account: '$ownerAccount',
              _amount: '$amount',
              amount: '$mainAmount',
            },
            {
              _account: '$payingAccount',
              _amount: '$amount',
              amount: '$mainAmount',
            },
          ],
          cond: {
            $ne: [
              {
                $ifNull: [
                  '$$this._account',
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
      path: '$dupes',
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          '$$ROOT',
          '$dupes',
        ],
      },
    },
  },
  {
    $unset: [
      'dupes',
      'splits',
      'mainAmount',
      'mainDescription',
    ],
  },
  {
    $match: {
      _account: new Types.ObjectId(accountId),
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
      as: 'deferredTransactions',
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
                      '$_account',
                      '$ownerAccount',
                    ],
                  },
                  then: {
                    $multiply: [
                      {
                        $sum: [
                          '$_amount',
                          {
                            $sum: '$deferredTransactions.payments.amount',
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
                      '$_account',
                      '$payingAccount',
                    ],
                  },
                  then: {
                    $sum: [
                      '$_amount',
                      {
                        $sum: '$deferredTransactions.payments.amount',
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
      'deferredTransactions',
      '_account',
    ],
  },
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
      from: 'accounts',
      localField: 'transferAccount',
      foreignField: '_id',
      as: 'transferAccount',
    },
  },
  {
    $unwind: {
      path: '$transferAccount',
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
      _id: '$_id',
      transactionType: {
        $first: '$transactionType',
      },
      temp: {
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
              '$temp',
              0,
            ],
          },
        ],
      },
    },
  },
  {
    $set: {
      category: {
        $cond: [
          {
            $eq: [
              '$transactionType',
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
              '$transactionType',
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
              '$transactionType',
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
              '$transactionType',
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
              '$transactionType',
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
              '$transactionType',
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
              '$transactionType',
              'split',
            ],
          },
          '$$REMOVE',
          '$billingEndDate',
        ],
      },
      splits: {
        $cond: {
          if: {
            $eq: [
              '$transactionType',
              'split',
            ],
          },
          then: {
            $map: {
              input: '$temp',
              in: {
                amount: '$$this._amount',
                description: '$$this._description',
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
      '_amount',
      '_description',
      'temp',
    ],
  },
  {
    $sort: {
      issuedAt: -1,
    },
  },
];

