import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateProductService } from '@household/api/functions/update-product/update-product.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateProduct: IUpdateProductService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { productId } = castPathParameters(event);

    try {
      await updateProduct({
        productId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      productId,
    });
  };
};
