import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IAddCustomerToBlacklistService } from '@household/api/functions/add-customer-to-blacklist/add-customer-to-blacklist.service';

export default (addCustomerToBlacklist: IAddCustomerToBlacklistService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    try {
      await addCustomerToBlacklist(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
