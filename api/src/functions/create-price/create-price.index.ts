import { createPriceServiceFactory } from '@household/api/functions/create-price/create-price.service';
import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { default as handler } from '@household/api/functions/create-price/create-price.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/price-request';
import { priceService } from '@household/shared/dependencies/services/price-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const createPriceService = createPriceServiceFactory(priceService, priceDocumentConverter);

export default index({
  handler: handler(createPriceService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
