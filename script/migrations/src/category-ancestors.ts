import { config } from 'dotenv';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { writeFileSync } from 'fs';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const categories = await mongodbService.categories.find({}, null, {
      sort: {
        fullName: 1,
      },
    });

    categories.forEach((category) => {
      // console.log('CAT', category);
      if (!category.parentCategory) {
        category.ancestors = [];
      } else {
        const parentCategory = categories.find(c => c._id.toString() === category.parentCategory._id.toString());
        // console.log('PARENT', parentCategory);
        category.ancestors = [
          ...parentCategory.ancestors,
          category.parentCategory,
        ];
      }
    });

    writeFileSync('categories.json', JSON.stringify(categories));

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
