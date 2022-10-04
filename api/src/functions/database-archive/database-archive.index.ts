import { default as handler } from '@household/api/functions/database-archive/database-archive.handler';
import { databaseArchiveServiceFactory } from '@household/api/functions/database-archive/database-archive.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { storageService } from '@household/shared/dependencies/services/storage-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { productService } from '@household/shared/dependencies/services/product-service';

const databaseArchiveService = databaseArchiveServiceFactory(accountService, projectService, categoryService, recipientService, transactionService, productService, storageService);

export default index({
  handler: handler(databaseArchiveService),
  before: [ ],
  after: [],
});
