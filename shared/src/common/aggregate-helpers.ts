import { AccountType, TransactionType } from '@household/shared/enums';
import { Expression, PipelineStage } from 'mongoose';

export const findById = (idProperty: string, array: string): Expression.First => {
  return {
    $first: {
      $filter: {
        input: array,
        cond: {
          $eq: [
            '$$this._id',
            idProperty,
          ],
        },
      },
    },
  };
};

export const lookup = (from: string, localField: string, pipeline?: PipelineStage.Lookup['$lookup']['pipeline']): PipelineStage.Lookup => {
  return {
    $lookup: {
      from, 
      localField,
      foreignField: '_id',
      as: localField,
      ...(pipeline ? {
        pipeline,
      } : {}),
    },
  };
};

export const matchAnyProperty = (value: any, properties: string[]): PipelineStage.Match => {
  return {
    $match: {
      $or: properties.map(p => ({
        [p]: value,
      })),
    },
  };
};

export const populateAggregate = (localField: string, from: string, pipeline?: PipelineStage.Lookup['$lookup']['pipeline']): [PipelineStage.Lookup, PipelineStage.Unwind] => [
  {
    $lookup: {
      from,
      localField,
      foreignField: '_id',
      as: localField,
      ...(pipeline ? {
        pipeline,
      } : {}),
    },
  },
  {
    $unwind: {
      path: `$${localField}`,
      preserveNullAndEmptyArrays: true,
    },
  },
];

export const transactionAggregate: PipelineStage[] = [
  {
    $lookup: {
      from: 'transactions',
      let: {
        transactionId: '$_id',
        deferredSplits: '$deferredSplits',
      },
      as: 'repayments',
      pipeline: [
        {
          $unwind: {
            path: '$payments',
          },
        },
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: [
                    '$$transactionId',
                    '$payments.transaction',
                  ],
                },
                {
                  $in: [
                    '$payments.transaction',
                    {
                      $map: {
                        input: {
                          $ifNull: [
                            '$$deferredSplits',
                            [],
                          ],
                        },
                        as: 'split',
                        in: '$$split._id',
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$payments',
          },
        },
      ],
    },
  },
  {
    $set: {
      remainingAmount: {
        $cond: {
          if: {
            $and: [
              {
                $eq: [
                  '$transactionType',
                  TransactionType.Deferred,
                ],
              },
              {
                $eq: [
                  '$isSettled',
                  false,
                ],
              },
            ],
          },
          then: {
            $subtract: [
              {
                $abs: '$amount',
              },
              {
                $sum: '$repayments.amount',
              },
            ],
          },
          else: '$$REMOVE',
        },
      },
    },
  }, 
  ...populateAggregate('recipient', 'recipients'),
  {
    $set: {
      allSplits: {
        $concatArrays: [
          {
            $ifNull: [
              '$splits',
              [],
            ],
          },
          {
            $ifNull: [
              '$deferredSplits',
              [],
            ],
          },
        ],
      },
    },
  },
  {
    $set: {
      allProjects: {
        $concatArrays: [
          ['$project'],
          {
            $map: {
              input: '$allSplits',
              in: '$$this.project',
            },
          },
        ],
      },
      allProducts: {
        $concatArrays: [
          ['$product'],
          {
            $map: {
              input: '$allSplits',
              in: '$$this.product',
            },
          },
        ],
      },
      allCategories: {
        $concatArrays: [
          ['$category'],
          {
            $map: {
              input: '$allSplits',
              in: '$$this.category',
            },
          },
        ],
      },
      allAccounts: {
        $concatArrays: [
          [
            '$account',
            '$transferAccount',
            '$payingAccount',
            '$ownerAccount',
          ],
          {
            $map: {
              input: '$allSplits',
              in: '$$this.ownerAccount',
            },
          },
        ],
      },
    },
  },
  lookup('projects', 'allProjects'),
  lookup('products', 'allProducts'),
  lookup('categories', 'allCategories', [
    {
      $lookup: {
        from: 'categories',
        localField: 'ancestors',
        foreignField: '_id',
        as: 'ancestors',
      },
    },
  ]),
  lookup('accounts', 'allAccounts'),
  {
    $set: {
      project: findById('$project', '$allProjects'),
      product: findById('$product', '$allProducts'),
      category: findById('$category', '$allCategories'),
      account: findById('$account', '$allAccounts'),
      transferAccount: findById('$transferAccount', '$allAccounts'),
      payingAccount: findById('$payingAccount', '$allAccounts'),
      ownerAccount: findById('$ownerAccount', '$allAccounts'),
      splits: {
        $cond: {
          if: {
            $ne: [
              {
                $type: '$splits',
              },
              'missing',
            ],
          },
          then: {
            $map: {
              input: '$splits',
              as: 's',
              in: {
                $mergeObjects: [
                  '$$s',
                  {
                    project: findById('$$s.project', '$allProjects'),
                    product: findById('$$s.product', '$allProducts'),
                    category: findById('$$s.category', '$allCategories'),
                  },
                ],
              },
            },
          },
          else: '$$REMOVE',
        },
      },
      deferredSplits: {
        $cond: {
          if: {
            $ne: [
              {
                $type: '$deferredSplits',
              },
              'missing',
            ],
          },
          then: {
            $map: {
              input: '$deferredSplits',
              as: 's',
              in: {
                $mergeObjects: [
                  '$$s',
                  {
                    remainingAmount: {
                      $cond: {
                        if: {
                          $eq: [
                            '$$s.isSettled',
                            false,
                          ],
                        },
                        then: {
                          $subtract: [
                            {
                              $abs: '$$s.amount',
                            },
                            {
                              $sum: {
                                $map: {
                                  input: '$repayments',
                                  as: 'payment',
                                  in: {
                                    $cond: {
                                      if: {
                                        $eq: [
                                          '$$payment.transaction',
                                          '$$s._id',
                                        ],
                                      },
                                      then: '$$payment.amount',
                                      else: 0,
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                        else: '$$REMOVE',
                      },
                    },                            
                    project: findById('$$s.project', '$allProjects'),
                    product: findById('$$s.product', '$allProducts'),
                    category: findById('$$s.category', '$allCategories'),
                    ownerAccount: findById('$$s.ownerAccount', '$allAccounts'),
                    payingAccount: findById('$$s.payingAccount', '$allAccounts'),
                  },
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
    $unset: [
      'allAccounts',
      'allProjects',
      'allProducts',
      'allCategories',
      'allSplits',
      'repayments',
    ],
  },
];

export const calculateAccountBalances = (): [PipelineStage.Lookup, PipelineStage.Set, PipelineStage.Unset] => [
  {
    $lookup: {
      from: 'transactions',
      let: {
        accountId: '$_id',
        accountType: '$accountType',
      },
      as: 'transactions',
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $eq: [
                    '$$accountId',
                    '$account',
                  ],
                },
                {
                  $eq: [
                    '$$accountId',
                    '$transferAccount',
                  ],
                },
                {
                  $eq: [
                    '$$accountId',
                    '$payingAccount',
                  ],
                },
                {
                  $and: [
                    {
                      $eq: [
                        '$$accountType',
                        AccountType.Loan,
                      ],
                    },
                    {
                      $or: [
                        {
                          $eq: [
                            '$$accountId',
                            '$ownerAccount',
                          ],
                        },
                        {
                          $in: [
                            '$$accountId',
                            {
                              $map: {
                                input: {
                                  $ifNull: [
                                    '$deferredSplits',
                                    [],
                                  ],
                                },
                                as: 'split',
                                in: '$$split.ownerAccount',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
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
                    $in: [
                      '$_id',
                      [
                        '$$this.account',
                        '$$this.payingAccount',
                      ],
                    ],
                  },
                  then: '$$this.amount',
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $eq: [
                      '$$this.transferAccount',
                      '$_id',
                    ],
                  },
                  then: '$$this.transferAmount',
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$accountType',
                          AccountType.Loan,
                        ],
                      },
                      {
                        $eq: [
                          '$$this.ownerAccount',
                          '$_id',
                        ],
                      },
                    ],
                  },
                  then: {
                    $multiply: [
                      -1,
                      '$$this.amount',
                    ],
                  },
                  else: 0,
                },
              },
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          '$accountType',
                          AccountType.Loan,
                        ],
                      },
                      {
                        $ne: [
                          {
                            $type: '$$this.deferredSplits',
                          },
                          'missing',
                        ],
                      },
                    ],
                  },
                  then: {
                    $sum: {
                      $map: {
                        input: '$$this.deferredSplits',
                        as: 'split',
                        in: {
                          $cond: {
                            if: {
                              $eq: [
                                '$$split.ownerAccount',
                                '$_id',
                              ],
                            },
                            then: {
                              $multiply: [
                                -1,
                                '$$split.amount',
                              ],
                            },
                            else: 0,
                          },
                        },
                      },
                    },
                  },
                  else: 0,
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unset: ['transactions'],
  },
];
