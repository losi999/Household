import { config } from 'dotenv';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    await mongodbService.projects().updateMany({
      description: '',
    }, {
      $unset: {
        description: 1,
      },
    });

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }

})();
