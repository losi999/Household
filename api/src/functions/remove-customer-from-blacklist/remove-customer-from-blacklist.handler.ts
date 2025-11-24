import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IRemoveCustomerFromBlacklistService } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.service';

export default (removeCustomerFromBlacklist: IRemoveCustomerFromBlacklistService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    try {
      await removeCustomerFromBlacklist(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
