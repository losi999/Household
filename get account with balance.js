var accountId = '665aca435689536dd37d847d'
db.getCollection("accounts").aggregate([
  {
    $match: {
      _id: ObjectId(accountId),
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
                '$splits',
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
            $expr: {
              $eq: [
                '$$accountId',
                '$tmp_account',
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
                    'deferred'
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
                          '$$this.accounts.ownerAccount',
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
                          '$$this.accounts.payingAccount',
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
            $sum: '$tmp_tx.remainingAmount',
          },
        },
      },
    },
  },
  {
    $unset: ['tmp_tx'],
  },
])
