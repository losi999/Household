import { IMigrateProductsService } from '@household/api/functions/migrate-products/migrate-products.service';

export default (migrateProducts: IMigrateProductsService): AWSLambda.Handler =>
  async () => {
    await migrateProducts();
  };
