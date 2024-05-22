import { populate } from '@household/shared/common/utils';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types } from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const categoryId = '655f7ebf64f05d1d6e13bea8';

    const res = await mongodbService.transactions.find<Transaction.PaymentDocument | Transaction.SplitDocument>({
      transactionType: {
        $not: {
          $eq: 'transfer',
        },
      },
      issuedAt: {
        $lte: new Date(),
      },
      $and: [
        {
          $or: [
            {
              // 'splits.category': {
              //   $in: [categoryId],
              // },
              splits: {
                $elemMatch: {
                  category: {
                    $in: [categoryId],
                  },
                },
              },
            },
            {
              category: {
                $in: [categoryId],
              },
            },
          ],
        },
      ],
    }, {

      splits: {
        $elemMatch: {
          category: {
            $in: [categoryId],
          },
        },
      },
    })

      .setOptions({
        // populate: populate('project',
        //   'recipient',
        //   'account',
        //   'category',
        //   'inventory.product',
        //   'transferAccount',
        //   'splits.category',
        //   'splits.project',
        //   'splits.inventory.product'),
        lean: true,
        sort: {
          issuedAt: 'asc',
        },
      })
      .exec();

    console.log(JSON.stringify(res, null, 2));

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
