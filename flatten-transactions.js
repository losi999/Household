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
          {
            mainDescription: '$description',
          },
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
              account: '$account',
              amount: '$amount',
            },
            {
              account: '$transferAccount',
              amount: {
                $ifNull: [
                  '$transferAmount',
                  '$amount',
                ],
              },
            },
            {
              account: '$ownerAccount',
              amount: '$amount',
            },
            {
              account: '$payingAccount',
              amount: '$amount',
            },
          ],
          cond: {
            $ne: [
              {
                $ifNull: [
                  '$$this.account',
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
])
