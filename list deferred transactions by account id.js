//var accountId = '665aca365689536dd37d8468' //bank
var accountId = '665aca435689536dd37d847d'//revolut
//var accountId = '665aca665689536dd37d847f' //kölcsön
//var transactionId = '6661ad409aa7a24ca46db310'

db.getCollection("transactions").aggregate([
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
    $match: {
      'accounts.payingAccount': {
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
        $add: ['$amount', { $sum: '$tmp_deferredTransactions.payments.amount' }]
      },
    },
  },
  {
    $unset: ['tmp_deferredTransactions', 'splits', 'tx_amount', 'tx_description', 'tx_id', 'tx_transactionType'],
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
