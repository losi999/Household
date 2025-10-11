import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdatePriceService } from '@household/api/functions/update-price/update-price.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updatePrice: IUpdatePriceService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { priceId } = castPathParameters(event);

    try {
      await updatePrice({
        priceId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      priceId,
    });
  };
};
