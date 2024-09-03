import { IMigrateCategoriesService } from '@household/api/functions/migrate-categories/migrate-categories.service';

export default (migrateCategories: IMigrateCategoriesService): AWSLambda.Handler =>
  async () => {
    await migrateCategories();
  };
