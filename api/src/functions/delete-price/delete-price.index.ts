import { default as handler } from '@household/api/functions/delete-price/delete-price.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deletePriceServiceFactory } from '@household/api/functions/delete-price/delete-price.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/price-id';
import { priceService } from '@household/shared/dependencies/services/price-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const deletePriceService = deletePriceServiceFactory(priceService);

export default index({
  handler: handler(deletePriceService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
