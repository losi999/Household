var pageNumber = 1
var pageSize = 25
var accountId = '665aca365689536dd37d8468' //bank
//var accountId = '665aca435689536dd37d847d'//revolut
var transactionId = '6756e055a0399f72c30fef9e'

db.getCollection("transactions").aggregate([
  {
    $match: {
      _id: ObjectId(transactionId)
    }
  },
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
            tx_transactionType: '$transactionType',
            description: {
              $ifNull: ['$tmp_splits.description', null]
            }
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
              tx_amount: {
                $cond: {
                  if: {
                    $eq: [
                      '$transactionType',
                      'reimbursement',
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
      tmp_account: ObjectId(accountId),
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
    }
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
  {
    $unset: ['tmp_deferredTransactions', 'tmp_account']
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
      _id: '$tx_id',
      tmp_splits: {
        $push: '$$ROOT'
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: ['$$ROOT',
          {
            $arrayElemAt: ['$tmp_splits', 0]
          },
        ]
      },
    }
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
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$category']
      },
      project: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$project']
      },
      quantity: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$quantity']
      },
      product: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$product']
      },
      invoiceNumber: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$invoiceNumber']
      },
      billingStartDate: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$billingStartDate']
      },
      billingEndDate: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$billingEndDate']
      },
      remainingAmount: {
        $cond: [{ $eq: ['$tx_transactionType', 'split'] }, '$$REMOVE', '$remainingAmount']
      },
      splits: {
        $cond: {
          if: {
            $eq: ['$tx_transactionType', 'split']
          },
          then: {
            $map: {
              input: {
                $filter: {
                  input: '$tmp_splits',
                  cond: {
                    $ne: ['$$this.transactionType', 'deferred']
                  }
                }
              },
              in: {
                _id: '$$this._id',
                amount: '$$this.amount',
                description: {
                  "$cond": {
                    "if": {
                      "$ne": [
                        "$$this.description",
                        null
                      ]
                    },
                    "then": '$$this.description',
                    "else": '$$REMOVE'
                  }
                },
                category: '$$this.category',
                project: '$$this.project',
                quantity: '$$this.quantity',
                product: '$$this.product',
                invoiceNumber: '$$this.invoiceNumber',
                billingStartDate: '$$this.billingStartDate',
                billingEndDate: '$$this.billingEndDate'
              }
            }
          },
          else: '$$REMOVE'
        }
      },
      deferredSplits: {
        $cond: {
          if: {
            $eq: ['$tx_transactionType', 'split']
          },
          then: {
            $map: {
              input: {
                $filter: {
                  input: '$tmp_splits',
                  cond: {
                    $eq: ['$$this.transactionType', 'deferred']
                  }
                }
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
                  "$cond": {
                    "if": {
                      "$ne": [
                        "$$this.description",
                        null
                      ]
                    },
                    "then": '$$this.description',
                    "else": '$$REMOVE'
                  }
                },
                category: '$$this.category',
                project: '$$this.project',
                quantity: '$$this.quantity',
                product: '$$this.product',
                invoiceNumber: '$$this.invoiceNumber',
                billingStartDate: '$$this.billingStartDate',
                billingEndDate: '$$this.billingEndDate'
              }
            }
          },
          else: '$$REMOVE'
        }
      }
    }
  },
  {
    $unset: ['tx_amount', 'tx_description', 'tmp_splits', 'tx_id', 'tx_transactionType']
  },
])

