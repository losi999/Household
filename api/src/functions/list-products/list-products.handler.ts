
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListProductsService } from '@household/api/functions/list-products/list-products.service';
import { Product } from '@household/shared/types/types';

export default (listProducts: IListProductsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let products: Product.GroupedResponse[];
    try {
      products = await listProducts();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(products);
  };
};
