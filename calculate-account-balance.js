const aggregate = [
  {
    $lookup: {
      from: 'transactions',
      let: {
        accountId: '$_id',
      },
      pipeline: [
        {
          $set: {
            tmp_splits: {
              $concatArrays: [{
                $ifNull: ['$splits', []]
              }, {
                $ifNull: ['$deferredSplits', []]
              }]
            }
          }
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
                  tx_transactionType: '$transactionType'
                }
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
                    tmp_account: {
                      $cond: {
                        if: {
                          $ne: ['$transactionType', 'deferred']
                        },
                        then: '$account',
                        else: null
                      }
                    },
                  },
                  {
                    tmp_account: '$transferAccount',
                    amount: {
                      $ifNull: [
                        '$transferAmount',
                        '$amount',
                      ],
                    },
                  },
                  {
                    tmp_account: '$ownerAccount',
                  },
                  {
                    tmp_account: '$payingAccount',
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
            'tmp_splits',
            'splits',
            'deferredSplits'
          ],
        },
        {
          $match: {
            $expr: {
              $eq: [
                '$$accountId',
                '$tmp_account',
              ],
            },
          },
        },
      ],
      as: 'tmp_tx',
    },
  },
  {
    $set: {
      balance: {
        $reduce: {
          input: '$tmp_tx',
          initialValue: 0,
          in: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          '$$this.tmp_account',
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
                          '$$this.tmp_account',
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
    },
  },
//  {
//    $unset: ['tmp_tx'],
//  },
  {
    $sort: {
      name: 1,
    },
  },
];

db.getCollection('accounts').aggregate(aggregate);
