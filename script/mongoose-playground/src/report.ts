import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import mongoose from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const accountIds: Account.Id[] = undefined;
    const categoryIds: Category.Id[] = undefined;
    const projectIds: Project.Id[] = undefined;
    const recipientIds: Recipient.Id[] = undefined;
    const productIds: Product.Id[] = ['633c8b6f2f66a75d04be2a3a'] as Product.Id[];
    const issuedAtFrom: string = '2023-11-01T00:00:00.000Z';
    const issuedAtTo: string = '2023-11-30T00:00:00.000Z' ;

    const aggregate = mongodbService.transactions.aggregate()
      .match({
        transactionType: {
          $not: {
            $eq: 'transfer',
          },
        },
        issuedAt: {
          $lte: new Date(),
        },
      });

    if (issuedAtFrom) {
      aggregate.match({
        issuedAt: {
          $gte: new Date(issuedAtFrom),
        },
      });
    }

    if (issuedAtTo) {
      aggregate.match({
        issuedAt: {
          $lte: new Date(issuedAtTo),
        },
      });
    }

    // if (accountIds) {
    //   query.$and.push({
    //     account: {
    //       $in: accountIds,
    //     },
    //   });
    // }

    // if (categoryIds) {
    //   query.$and.push({
    //     $or: [
    //       {
    //         'splits.category': {
    //           $in: categoryIds,
    //         },
    //       },
    //       {
    //         category: {
    //           $in: categoryIds,
    //         },
    //       },
    //     ],
    //   });
    // }

    // if (projectIds) {
    //   query.$and.push({
    //     $or: [
    //       {
    //         'splits.project': {
    //           $in: projectIds,
    //         },
    //       },
    //       {
    //         project: {
    //           $in: projectIds,
    //         },
    //       },
    //     ],
    //   });
    // }

    if (productIds) {
      aggregate.match({
        // $or: [
        // {
        'splits.inventory.product': (mongoose.Types.ObjectId as any)('633c8b6f2f66a75d04be2a3a'),
        //   },
        //   {
        //     'inventory.product': 'ObjectId("633c8b6f2f66a75d04be2a3a")',
        //   },
        // ],
      });
    }

    // if (recipientIds) {
    //   query.$and.push({
    //     recipient: {
    //       $in: recipientIds,
    //     },
    //   });
    // }

    const res = await aggregate
    /*.lookup({
      from: 'accounts',
      localField: 'account',
      foreignField: '_id',
      as: 'account',

    })*/.exec();

    // const res = await mongodbService.transactions().find(query)
    //   .sort({
    //     issuedAt: 'asc',
    //   })
    //   .populate('project')
    //   .populate('recipient')
    //   .populate('account')
    //   .populate('category')
    //   .populate('inventory.product')
    //   .populate('splits.category')
    //   .populate('splits.project')
    //   .populate('splits.inventory.product')
    //   .lean<(Transaction.PaymentDocument | Transaction.SplitDocument)[]>()
    //   .exec();

    console.log('res', res);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
