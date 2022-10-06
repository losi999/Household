import { default as handler } from '@household/api/functions/merge-products/merge-products.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/product-id';
import { default as body } from '@household/shared/schemas/product-id-list';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';
import { mergeProductsServiceFactory } from '@household/api/functions/merge-products/merge-products.service';
import { categoryService } from '@household/shared/dependencies/services/category-service';

const mergeProductsService = mergeProductsServiceFactory(productService, categoryService);

export default index({
  handler: handler(mergeProductsService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
