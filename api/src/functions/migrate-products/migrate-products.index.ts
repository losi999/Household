import { migrateProductsServiceFactory } from '@household/api/functions/migrate-products/migrate-products.service';
import { default as handler } from '@household/api/functions/migrate-products/migrate-products.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { settingService } from '@household/shared/dependencies/services/setting-service';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const migrateProductsService = migrateProductsServiceFactory(settingService, mongodbService);

export default index({
  handler: handler(migrateProductsService),
  before: [],
  after: [mongoDisconnect],
});
