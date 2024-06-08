import { PipelineStage, Types } from 'mongoose';

export const getAccountWithBalance = (accountId: string): PipelineStage[] => [
  {
    $match: {
      _id: new Types.ObjectId(accountId),
    },
  },
  {
    $lookup: {
      from: 'transactions',
      let: {
        accountId: '$_id',
      },
      pipeline: [
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
                    account: '$account',
                    amount: '$amount',
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
                    amount: '$amount',
                  },
                  {
                    account: '$payingAccount',
                    amount: '$amount',
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
          ],
        },
        {
          $match: {
            $expr: {
              $eq: [
                '$$accountId',
                '$account',
              ],
            },
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
            as: 'deferredTransaction',
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
                            '$account',
                            '$ownerAccount',
                          ],
                        },
                        then: {
                          $multiply: [
                            {
                              $sum: [
                                '$amount',
                                {
                                  $sum: '$deferredTransaction.payments.amount',
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
                            '$account',
                            '$payingAccount',
                          ],
                        },
                        then: {
                          $sum: [
                            '$amount',
                            {
                              $sum: '$deferredTransaction.payments.amount',
                            },
                          ],
                        },
                      },
                    ],
                    default: 0,
                  },
                },
                else: 0,

              },
            },
          },
        },
      ],
      as: 'tx',
    },
  },
  {
    $set: {
      balance: {
        $reduce: {
          input: '$tx',
          initialValue: 0,
          in: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          '$$this.account',
                          '$$this.ownerAccount',
                        ],
                      },
                      {
                        $ne: [
                          '$accountType',
                          'loan',
                        ],
                      },
                    ],
                  },
                  then: '$$value',
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          '$$this.account',
                          '$$this.payingAccount',
                        ],
                      },
                      {
                        $eq: [
                          '$accountType',
                          'loan',
                        ],
                      },
                    ],
                  },
                  then: {
                    $subtract: [
                      '$$value',
                      '$$this.amount',
                    ],
                  },
                },
              ],
              default: {
                $sum: [
                  '$$value',
                  '$$this.amount',
                ],
              },
            },
          },
        },
      },
      loanBalance: {
        $cond: {
          if: {
            $eq: [
              '$accountType',
              'loan',
            ],
          },
          then: 0,
          else: {
            $sum: '$tx.remainingAmount',
          },
        },
      },
    },
  },
  {
    $unset: ['tx'],
  },
  {
    $sort: {
      name: 1,
    },
  },
];

