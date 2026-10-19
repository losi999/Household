import { AccountType } from '@household/shared/enums';
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

// The full name of a product is built from its parents, so they are looked up together with the product
export const productAggregate: PipelineStage.Lookup['$lookup']['pipeline'] = [
  ...populateAggregate('genericProduct', 'products'),
  ...populateAggregate('specificProduct', 'products'),
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
                                    '$loans',
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
                            $type: '$$this.loans',
                          },
                          'missing',
                        ],
                      },
                    ],
                  },
                  then: {
                    $sum: {
                      $map: {
                        input: '$$this.loans',
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
