import { default as handler } from '@household/api/functions/delete-product/delete-product.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteProductServiceFactory } from '@household/api/functions/delete-product/delete-product.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/product-id';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';

const deleteProductService = deleteProductServiceFactory(productService);

export default index({
  handler: handler(deleteProductService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
