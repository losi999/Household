import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IUpdateCustomerBlacklistService } from '@household/api/functions/update-customer-blacklist/update-customer-blacklist.service';

export default (updateCustomerBlacklist: IUpdateCustomerBlacklistService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    try {
      await updateCustomerBlacklist(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
