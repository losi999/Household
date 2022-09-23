import { createProductServiceFactory } from '@household/api/functions/create-product/create-product.service';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { default as handler } from '@household/api/functions/create-product/create-product.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/product-request';
import { default as pathParameters } from '@household/shared/schemas/category-id';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';
import { categoryService } from '@household/shared/dependencies/services/category-service';

const createProductService = createProductServiceFactory(productService, categoryService, productDocumentConverter);

export default index({
  handler: handler(createProductService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
