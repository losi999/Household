
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListPricesService } from '@household/api/functions/list-prices/list-prices.service';
import { Responses } from '@household/shared/types/responses';

export default (listPrices: IListPricesService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let prices: Responses.Price[];
    try {
      prices = await listPrices();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(prices);
  };
};
