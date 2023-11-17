import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { config } from 'dotenv';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const res = await mongodbService.categories().findById('655743e8d9095e669b61ffe3');

    console.log('res', res);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
