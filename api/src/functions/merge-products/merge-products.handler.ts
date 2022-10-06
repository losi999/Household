import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IMergeProductsService } from '@household/api/functions/merge-products/merge-products.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (mergeProducts: IMergeProductsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { productId } = castPathParameters(event);

    try {
      await mergeProducts({
        productId,
        body,
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
