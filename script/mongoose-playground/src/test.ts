import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { config } from 'dotenv';
import { Types } from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const categoryId = '655f7ebf64f05d1d6e13bea8';

    const res = await mongodbService.categories()
      .aggregate()
      .match({
        _id: new Types.ObjectId(categoryId),
      })
      .lookup({
        from: 'categories',
        localField: 'parentCategory',
        foreignField: '_id',
        as: 'parentCategory',
      })
      .lookup({
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
        pipeline: [
          {
            $sort: {
              fullName: 1,
            },
          },
        ],
      })
      .addFields({
        parentCategory: {
          $cond: {
            if: {
              $eq: [
                {
                  $size: '$parentCategory',
                },
                0,
              ],
            },
            then: '$$REMOVE',
            else: {
              $arrayElemAt: [
                '$parentCategory',
                0,
              ],
            },

          },
        },
        products: {
          $cond: {
            if: {
              $eq: [
                {
                  $size: '$products',
                },
                0,
              ],
            },
            then: '$$REMOVE',
            else: '$products',
          },
        },
      })
      .collation({
        locale: 'hu',
      })
      .sort('fullName')
      .exec();

    console.log(JSON.stringify(res, null, 2));

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
