
import { IMigrateInvoiceInventoryService } from '@household/api/functions/migrate-invoice-inventory/migrate-invoice-inventory.service';

export default (migrateInvoiceInventory: IMigrateInvoiceInventoryService): AWSLambda.Handler =>
  async () => {
    await migrateInvoiceInventory();
  };
