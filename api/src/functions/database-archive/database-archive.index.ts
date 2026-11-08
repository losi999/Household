import { default as handler } from '@household/api/functions/database-archive/database-archive.handler';
import { databaseArchiveServiceFactory } from '@household/api/functions/database-archive/database-archive.service';
import { databaseArchiveStorageService } from '@household/shared/dependencies/services/storage-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const databaseArchiveService = databaseArchiveServiceFactory(mongodbService, databaseArchiveStorageService);

export default index({
  handler: handler(databaseArchiveService),
  before: [ ],
  after: [],
});
