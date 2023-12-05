import { IMigrateCategoryProductRelationService } from '@household/api/functions/migrate-category-product-relation/migrate-category-product-relation.service';

export default (migrateCategoryProductRelation: IMigrateCategoryProductRelationService): AWSLambda.Handler =>
  async () => {
    await migrateCategoryProductRelation();
  };
