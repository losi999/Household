db.getCollection("transactions").aggregate([
  {
    "$unwind": {
      "path": "$deferredSplits",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    "$replaceRoot": {
      "newRoot": {
        "$mergeObjects": [
          "$$ROOT",
          "$deferredSplits",

        ]
      }
    }
  },
  {
    "$match": {
      "transactionType": "deferred",
      isSettled: false
    }
  },
  {
    "$lookup": {
      "from": "transactions",
      "let": {
        "transactionId": "$_id"
      },
      "pipeline": [
        {
          "$unwind": {
            "path": "$payments"
          }
        },
        {
          "$match": {
            "$expr": {
              "$eq": [
                "$$transactionId",
                "$payments.transaction"
              ]
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: '$payments',
          },
        },
      ],
      "as": "repayments"
    }
  },
  {
    $set: {
      remainingAmount: {
        $subtract: [
          {
            $abs: '$amount',
          },
          {
            $sum: '$repayments.amount',
          },
        ],

      }
    }
  },
  {
    $unset: ['deferredSplits', 'splits', 'repayments', 'account']
  },
  {
    $match: {
      remainingAmount: {
        $gt: 0
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
    "$sort": {
      "issuedAt": -1
    }
  }
])
