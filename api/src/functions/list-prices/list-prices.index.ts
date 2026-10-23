import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { default as handler } from '@household/api/functions/list-prices/list-prices.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listPricesServiceFactory } from '@household/api/functions/list-prices/list-prices.service';
import { priceService } from '@household/shared/dependencies/services/price-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listPricesService = listPricesServiceFactory(priceService, priceDocumentConverter);

export default index({
  handler: handler(listPricesService),
  before: [authorizer(UserType.Hairdresser)],
  after: [cors],
});
