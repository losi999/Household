import { createProductServiceFactory } from '@household/api/functions/create-product/create-product.service';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { default as handler } from '@household/api/functions/create-product/create-product.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { request as body } from '@household/shared/schemas/product';
import { productService } from '@household/shared/dependencies/services/product-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const createProductService = createProductServiceFactory(productService, productDocumentConverter);

export default index({
  handler: handler(createProductService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
