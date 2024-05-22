import { default as handler } from '@household/api/functions/migrate-invoice-inventory/migrate-invoice-inventory.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { migrateInvoiceInventoryServiceFactory } from '@household/api/functions/migrate-invoice-inventory/migrate-invoice-inventory.service';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const migrateInvoiceInventoryService = migrateInvoiceInventoryServiceFactory(mongodbService);

export default index({
  handler: handler(migrateInvoiceInventoryService),
  before: [],
  after: [],
});
