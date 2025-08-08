import { default as handler } from '@household/api/functions/update-price/update-price.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updatePriceServiceFactory } from '@household/api/functions/update-price/update-price.service';
import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { default as pathParameters } from '@household/shared/schemas/price-id';
import { default as body } from '@household/shared/schemas/price-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { priceService } from '@household/shared/dependencies/services/price-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updatePriceService = updatePriceServiceFactory(priceService, priceDocumentConverter);

export default index({
  handler: handler(updatePriceService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
