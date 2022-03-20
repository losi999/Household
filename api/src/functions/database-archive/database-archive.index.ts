import { default as handler } from '@household/api/functions/database-archive/database-archive.handler';
import { databaseArchiveServiceFactory } from '@household/api/functions/database-archive/database-archive.service';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { storageService } from '@household/shared/dependencies/services/storage-service';

const databaseArchiveService = databaseArchiveServiceFactory(databaseService, storageService);

export default handler(databaseArchiveService);
