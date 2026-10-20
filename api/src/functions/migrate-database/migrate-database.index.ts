import { migrateDatabaseServiceFactory } from '@household/api/functions/migrate-database/migrate-database.service';
import { default as handler } from '@household/api/functions/migrate-database/migrate-database.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { databaseArchiveStorageService } from '@household/shared/dependencies/services/storage-service';

const migrateProductsService = migrateDatabaseServiceFactory(mongodbService, databaseArchiveStorageService);

export default index({
  handler: handler(migrateProductsService),
  before: [],
  after: [],
});
