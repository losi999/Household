//var accountId = '665aca365689536dd37d8468' //bank
var accountId = '665aca435689536dd37d847d'//revolut
//var accountId = '665aca665689536dd37d847f' //kölcsön
//var transactionId = '6661ad409aa7a24ca46db310'

db.getCollection("transactions").aggregate([
  {
    $set: {
      tmp_splits: {
        $concatArrays: ['$splits', {
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
    $match: {
      'payingAccount': {
        $in: [ObjectId(accountId)]
      },
      transactionType: 'deferred'
    },
  },
  {
    $lookup: {
      from: 'transactions',
      let: {
        transactionId: '$_id',
      },
      pipeline: [
        //        {
        //          $match: {
        //            _id: {
        //              $ne: ObjectId(transactionId)
        //            }
        //          }
        //        },
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
          if: { $eq: ['$isSettled', true] },
          then: 0,
          else: { $add: ['$amount', { $sum: '$tmp_deferredTransactions.payments.amount' }] }
        }

      },
    },
  },
  {
    $unset: [
      'tmp_deferredTransactions',
      'deferredSplits',
      'account',
      'splits',
      'tx_amount',
      'tx_description',
      'tx_id',
      'tx_transactionType',
      'tmp_splits'
    ],
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
])
