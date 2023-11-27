import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { config } from 'dotenv';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const res = await mongodbService.transactions().find();

    console.log('res', typeof res[0].issuedAt);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
