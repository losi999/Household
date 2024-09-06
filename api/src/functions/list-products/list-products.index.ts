import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { default as handler } from '@household/api/functions/list-products/list-products.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listProductsServiceFactory } from '@household/api/functions/list-products/list-products.service';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';

const listProductsService = listProductsServiceFactory(productService, productDocumentConverter);

export default index({
  handler: handler(listProductsService),
  before: [],
  after: [cors],
});
