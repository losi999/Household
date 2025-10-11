
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListPricesService } from '@household/api/functions/list-prices/list-prices.service';
import { Price } from '@household/shared/types/types';

export default (listPrices: IListPricesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let prices: Price.Response[];
    try {
      prices = await listPrices();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(prices);
  };
};
