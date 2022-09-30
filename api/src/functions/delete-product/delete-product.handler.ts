import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteProductService } from '@household/api/functions/delete-product/delete-product.service';
import { castPathParameters } from '@household/shared/common/utils';

export default (deleteProduct: IDeleteProductService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { productId } = castPathParameters(event);

    try {
      await deleteProduct({
        productId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
