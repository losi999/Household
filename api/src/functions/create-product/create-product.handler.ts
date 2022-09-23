import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateProductService } from '@household/api/functions/create-product/create-product.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/utils';

export default (createProduct: ICreateProductService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { categoryId } = castPathParameters(event);

    let productId: string;
    try {
      productId = await createProduct({
        body,
        categoryId,
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
