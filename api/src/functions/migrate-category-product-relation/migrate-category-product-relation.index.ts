import { migrateCategoryProductRelationServiceFactory } from '@household/api/functions/migrate-category-product-relation/migrate-category-product-relation.service';
import { default as handler } from '@household/api/functions/post-deploy/post-deploy.handler';
import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';

const migrateCategoryProductRelationService = migrateCategoryProductRelationServiceFactory(mongodbService);

export default handler(migrateCategoryProductRelationService);
