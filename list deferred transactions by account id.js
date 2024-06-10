//var accountId = '665aca365689536dd37d8468' //bank
var accountId = '665aca435689536dd37d847d'//revolut
//var accountId = '665aca665689536dd37d847f' //kölcsön
//var transactionId = '66606744bb2522096f3356f2'

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
        ],
      },
    },
  },
  {
    $match: {
      //      _id: {
      //        $in: [ObjectId(transactionId)]
      //      },
      'accounts.payingAccount': {
        $in: [ObjectId(accountId)]
      },
      transactionType: {
        $in: ['deferred','deferredSplit']
      }
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
        $add: ['$amount', { $sum: '$deferredTransactions.payments.amount' }]
      },
    },
  },
  {
    $unset: ['deferredTransactions', 'splits'],
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
