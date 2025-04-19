//var accountId = ObjectId('665aca665689536dd37d847f') //kölcsön
//var accountType = 'loan'
var accountId = ObjectId('665aca365689536dd37d8468') //bankszámla
var accountType = 'bankAccount'

db.getCollection("transactions").aggregate([
  {
    "$match": {
      "$or": [
        {
          "account": accountId
        },
        {
          "transferAccount": accountId
        },
        {
          "payingAccount": accountId
        },
        {
          "ownerAccount": accountId
        },
        {
          "deferredSplits.ownerAccount": accountId
        }
      ]
    }
  },
  {
    "$sort": {
      "issuedAt": -1
    }
  },
  {
    "$skip": 0
  },
  {
    "$limit": 25
  },
  {
    $lookup: {
      from: 'transactions',
      let: {
        transactionId: '$_id',
        deferredSplits: '$deferredSplits'
      },
      as: 'repayments',
      pipeline: [
        {
          $unwind: {
            path: '$payments'
          }
        },
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: ['$$transactionId', '$payments.transaction']
                },
                {
                  $in: ['$payments.transaction', {
                    $map: {
                      input: { $ifNull: ['$$deferredSplits', []] },
                      as: 'split',
                      in: '$$split._id'
                    }
                  }]
                }
              ]
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: '$payments'
          }
        }
      ]
    }
  },
  {
    "$lookup": {
      "from": "accounts",
      "localField": "account",
      "foreignField": "_id",
      "as": "account"
    }
  },
  {
    "$unwind": {
      "path": "$account",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "projects",
      "localField": "deferredSplits.project",
      "foreignField": "_id",
      "as": "projects"
    }
  },
  {
    "$lookup": {
      "from": "products",
      "localField": "deferredSplits.product",
      "foreignField": "_id",
      "as": "products"
    }
  },
  {
    "$lookup": {
      "from": "accounts",
      "localField": "deferredSplits.ownerAccount",
      "foreignField": "_id",
      "as": "accounts"
    }
  },
  {
    "$lookup": {
      "from": "categories",
      let: {
        categoryIds: {
          $map: {
            input: '$deferredSplits',
            as: 'split',
            in: '$$split.category'
          }
        }
      },
      "as": "categories",
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', { $ifNull: ['$$categoryIds', []] }]
            }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'ancestors',
            foreignField: '_id',
            as: 'ancestors'
          }
        }
      ]
    }
  },
  {
    $set: {
      amount: {
        $cond: {
          if: {
            $and: [
              {
                $eq: [accountType, 'loan']
              },
              {
                $eq: ['$transactionType', 'deferred']
              }
            ]
          },
          then: { $multiply: [-1, '$amount'] },
          else: '$amount'
        }
      },
      splits: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ['$transactionType', 'split']
              },
              {
                $ne: ['$account', accountId]
              }
            ]
          },
          then: [],
          else: '$splits'
        }
      },
      remainingAmount: {
        $cond: {
          if: {
            $and: [
              {
                $eq: ['$transactionType', 'deferred']
              }, {
                $eq: ['$isSettled', false]
              }
            ]
          },
          then: {
            $subtract: [{
              $abs: '$amount'
            }, {
              $sum: '$repayments.amount'
            }]

          },
          else: '$$REMOVE'
        }
      },
      deferredSplits: {
        $cond: {
          if: {
            $ne: [
              { $type: "$deferredSplits" },
              "missing"
            ]
          },
          then: {
            $map: {
              input: '$deferredSplits',
              as: 'split',
              in: {
                $mergeObjects: [
                  '$$split',
                  {
                    remainingAmount: {
                      $cond: {
                        if: {
                          $eq: ['$$split.isSettled', false]
                        },
                        then: {
                          $subtract: [
                            {
                              $abs: '$$split.amount'
                            },
                            {
                              $sum: {
                                $map: {
                                  input: '$repayments',
                                  as: 'payment',
                                  in: {
                                    $cond: {
                                      if: {
                                        $eq: ['$$payment.transaction', '$$split._id']
                                      },
                                      then: '$$payment.amount',
                                      else: 0
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        },
                        else: '$$REMOVE'
                      }
                    },
                    payingAccount: '$account',
                    ownerAccount: {
                      $first: {
                        $filter: {
                          input: '$accounts',
                          as: 'a',
                          cond: {
                            $eq: ['$$a._id', '$$split.ownerAccount']
                          }
                        }
                      }
                    },
                    project: {
                      $first: {
                        $filter: {
                          input: '$projects',
                          as: 'p',
                          cond: {
                            $eq: ['$$p._id', '$$split.project']
                          }
                        }
                      }
                    },
                    product: {
                      $first: {
                        $filter: {
                          input: '$products',
                          as: 'p',
                          cond: {
                            $eq: ['$$p._id', '$$split.product']
                          }
                        }
                      }
                    },
                    category: {
                      $first: {
                        $filter: {
                          input: '$categories',
                          as: 'c',
                          cond: {
                            $eq: ['$$c._id', '$$split.category']
                          }
                        }
                      }
                    },
                  }
                ]
              }
            }
          },
          else: '$$REMOVE'
        }
      }
    }
  },
  {
    $unset: [
      'repayments'
    ]
  },
  {
    "$lookup": {
      "from": "projects",
      "localField": "splits.project",
      "foreignField": "_id",
      "as": "projects"
    }
  },
  {
    "$lookup": {
      "from": "products",
      "localField": "splits.product",
      "foreignField": "_id",
      "as": "products"
    }
  },
  {
    "$lookup": {
      "from": "categories",
      let: {
        categoryIds: {
          $map: {
            input: '$splits',
            as: 'split',
            in: '$$split.category'
          }
        }
      },
      "as": "categories",
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', { $ifNull: ['$$categoryIds', []] }]
            }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'ancestors',
            foreignField: '_id',
            as: 'ancestors'
          }
        }
      ]
    }
  },
  {
    $set: {
      splits: {
        $cond: {
          if: {
            $ne: [
              { $type: "$splits" },
              "missing"
            ]
          },
          then: {
            $map: {
              input: '$splits',
              as: 'split',
              in: {
                $mergeObjects: [
                  '$$split',
                  {
                    project: {
                      $first: {
                        $filter: {
                          input: '$projects',
                          as: 'p',
                          cond: {
                            $eq: ['$$p._id', '$$split.project']
                          }
                        }
                      }
                    },
                    product: {
                      $first: {
                        $filter: {
                          input: '$products',
                          as: 'p',
                          cond: {
                            $eq: ['$$p._id', '$$split.product']
                          }
                        }
                      }
                    },
                    category: {
                      $first: {
                        $filter: {
                          input: '$categories',
                          as: 'c',
                          cond: {
                            $eq: ['$$c._id', '$$split.category']
                          }
                        }
                      }
                    },
                  }
                ]
              }
            }
          },
          else: '$$REMOVE'
        }
      }
    }
  },
  {
    "$lookup": {
      "from": "accounts",
      "localField": "payingAccount",
      "foreignField": "_id",
      "as": "payingAccount"
    }
  },
  {
    "$unwind": {
      "path": "$payingAccount",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "accounts",
      "localField": "ownerAccount",
      "foreignField": "_id",
      "as": "ownerAccount"
    }
  },
  {
    "$unwind": {
      "path": "$ownerAccount",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "accounts",
      "localField": "transferAccount",
      "foreignField": "_id",
      "as": "transferAccount"
    }
  },
  {
    "$unwind": {
      "path": "$transferAccount",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "categories",
      "localField": "category",
      "foreignField": "_id",
      "as": "category",
      "pipeline": [
        {
          "$lookup": {
            "from": "categories",
            "localField": "ancestors",
            "foreignField": "_id",
            "as": "ancestors"
          }
        }
      ]
    }
  },
  {
    "$unwind": {
      "path": "$category",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "projects",
      "localField": "project",
      "foreignField": "_id",
      "as": "project"
    }
  },
  {
    "$unwind": {
      "path": "$project",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "products",
      "localField": "product",
      "foreignField": "_id",
      "as": "product"
    }
  },
  {
    "$unwind": {
      "path": "$product",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$lookup": {
      "from": "recipients",
      "localField": "recipient",
      "foreignField": "_id",
      "as": "recipient"
    }
  },
  {
    "$unwind": {
      "path": "$recipient",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    $unset: ['projects', 'categories', 'products', 'accounts']
  }
])
