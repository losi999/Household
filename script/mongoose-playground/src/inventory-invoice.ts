import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { addSeconds } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types, startSession } from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const tx = await mongodbService.transactions.aggregate(
      [
        {
          $match: {
            $or: [
              {
                'splits.inventory': {
                  $exists: true,
                },
              },
              {
                'splits.invoice': {
                  $exists: true,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$splits',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $addFields: {
            'splits.quantity': '$splits.inventory.quantity',
            'splits.product': '$splits.inventory.product',
            'splits.invoiceNumber': '$splits.invoice.invoiceNumber',
            'splits.billingStartDate': '$splits.invoice.billingStartDate',
            'splits.billingEndDate': '$splits.invoice.billingEndDate',
          },
        },
        {
          $project: {
            'splits.inventory': 0,
            'splits.invoice': 0,
          },
        },
        {
          $group: {
            _id: '$_id',
            splits: {
              $push: '$$ROOT.splits',
            },
          },
        },
        {
          $merge: {
            into: 'transactions',
            on: '_id',
          },
        },
      ],
    );

    console.log(JSON.stringify(tx, null, 2));

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
