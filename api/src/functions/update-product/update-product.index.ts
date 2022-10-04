import { default as handler } from '@household/api/functions/update-product/update-product.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateProductServiceFactory } from '@household/api/functions/update-product/update-product.service';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { default as pathParameters } from '@household/shared/schemas/product-id';
import { default as body } from '@household/shared/schemas/product-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';

const updateProductService = updateProductServiceFactory(productService, productDocumentConverter);

export default index({
  handler: handler(updateProductService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
