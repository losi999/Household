import { default as handler } from '@household/api/functions/merge-categories/merge-categories.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/category-id';
import { default as body } from '@household/shared/schemas/category-id-list';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeCategoriesServiceFactory } from '@household/api/functions/merge-categories/merge-categories.service';

const mergeCategoriesService = mergeCategoriesServiceFactory(categoryService);

export default index({
  handler: handler(mergeCategoriesService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
