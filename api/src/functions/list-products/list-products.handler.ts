
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListProductsService } from '@household/api/functions/list-products/list-products.service';
import { Responses } from '@household/shared/types/responses';

export default (listProducts: IListProductsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let products: Responses.ProductGroupedResponse[];
    try {
      products = await listProducts();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(products);
  };
};
