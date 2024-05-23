import { config } from 'dotenv';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { Account, Category } from '@household/shared/types/types';
import { writeFileSync } from 'fs';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const categories = await mongodbService.categories
      // .aggregate()
      // .match({
      //   categoryType: 'inventory',
      // })
      // // .unwind('$products')
      .find({
        categoryType: 'inventory',
      })
      .populate('parentCategory')
      .populate({
        path: 'products',
        options: {
          sort: {
            fullName: 1,
          },
        },
      })
      .collation({
        locale: 'hu',
      })
      .sort('fullName')
      .sort('products.fullName')
      .lean<Category.Document[]>()
      .exec();

    console.log(categories[0]);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
