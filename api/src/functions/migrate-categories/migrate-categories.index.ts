import { default as handler } from '@household/api/functions/migrate-categories/migrate-categories.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { migrateCategoriesServiceFactory } from '@household/api/functions/migrate-categories/migrate-categories.service';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const migrateCategoriessService = migrateCategoriesServiceFactory(mongodbService);

export default index({
  handler: handler(migrateCategoriessService),
  before: [],
  after: [],
});
