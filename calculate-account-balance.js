const aggregate = [
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
                    _account: '$accounts.mainAccount',
                    _amount: '$amount',
                  },
                  {
                    _account: '$accounts.transferAccount',
                    _amount: {
                      $ifNull: [
                        '$transferAmount',
                        '$amount',
                      ],
                    },
                  },
                  {
                    _account: '$accounts.ownerAccount',
                    _amount: '$amount',
                  },
                  {
                    _account: '$accounts.payingAccount',
                    _amount: '$amount',
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
          ],
        },
        {
          $match: {
            $expr: {
              $eq: [
                '$$accountId',
                '$_account',
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
            as: 'deferredTransactions',
          },
        },
        {
          $set: {
            remainingAmount: {
              $cond: {
                if: {
                  $in: [
                    '$transactionType',
                    ['deferred','deferredSplit']
                  ],
                },
                then: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            '$_account',
                            '$accounts.ownerAccount',
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
                            '$accounts.payingAccount',
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
                          '$$this._account',
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
                          '$$this._account',
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
                      '$$this._amount',
                    ],
                  },
                },
              ],
              default: {
                $sum: [
                  '$$value',
                  '$$this._amount',
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
          then: '$$REMOVE',
          else: {
            $sum: '$tx.remainingAmount',
          },
        },
      },
    },
  },
  //  {
  //    $unset: ['tx'],
  //  },
  {
    $sort: {
      name: 1,
    },
  },
];

db.getCollection('accounts').aggregate(aggregate);
