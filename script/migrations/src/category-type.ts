import { config } from 'dotenv';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    await mongodbService.categories.updateMany({
      categoryType: undefined,
    }, {
      categoryType: 'regular',
    });

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
