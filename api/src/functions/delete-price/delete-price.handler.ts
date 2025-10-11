import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeletePriceService } from '@household/api/functions/delete-price/delete-price.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deletePrice: IDeletePriceService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { priceId } = castPathParameters(event);

    try {
      await deletePrice({
        priceId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
