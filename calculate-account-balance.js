const aggregate = [
  {
    $lookup: {
      from: 'transactions',
      let: {
        accountId: '$_id',
        accountType: "$accountType"
      },
      as: 'transactions',
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: ['$$accountId', '$account']
                },
                {
                  $eq: ['$$accountId', '$transferAccount']
                },
                {
                  $eq: ['$$accountId', '$payingAccount']
                },
                {
                  $and: [
                    { $eq: ["$$accountType", "loan"] },
                    {
                      $or: [
                        {
                          $eq: ['$$accountId', '$ownerAccount']
                        },
                        {
                          $in: [
                            "$$accountId",
                            {
                              $map: {
                                input: { $ifNull: ["$deferredSplits", []] },
                                as: "split",
                                in: "$$split.ownerAccount"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }
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
                    $or: [
                      {
                        $eq: ['$$this.account', '$_id']
                      },
                      {
                        $eq: ['$$this.payingAccount', '$_id']
                      }
                    ]

                  },
                  then: '$$this.amount',
                  else: 0
                }
              },
              {
                $cond: {
                  if: {
                    $eq: ['$$this.transferAccount', '$_id']
                  },
                  then: '$$this.transferAmount',
                  else: 0
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: ['$accountType', 'loan'],
                      },
                      {
                        $eq: ['$$this.ownerAccount', '$_id']
                      }
                    ]
                  },
                  then: { $multiply: [-1, "$$this.amount"] },
                  else: 0
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: ['$accountType', 'loan'],
                      },
                      {
                        $ne: [
                          { $type: "$$this.deferredSplits" },
                          "missing"
                        ]
                      }
                    ]
                  },
                  then: {
                    $sum: {
                      $map: {
                        input: '$$this.deferredSplits',
                        as: 'split',
                        in: {
                          $cond: {
                            if: {
                              $eq: ['$$split.ownerAccount', '$_id']
                            },
                            then: { $multiply: [-1, "$$split.amount"] },
                            else: 0
                          }
                        }
                      }
                    }
                  },
                  else: 0,
                }
              }
            ]
          }
        }
      }
    }
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
