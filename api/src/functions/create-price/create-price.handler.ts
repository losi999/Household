import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreatePriceService } from '@household/api/functions/create-price/create-price.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (createPrice: ICreatePriceService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let priceId: string;
    try {
      priceId = await createPrice({
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
