import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCustomerBlacklistService } from '@household/api/functions/delete-customer-blacklist/delete-customer-blacklist.service';

export default (deleteCustomerBlacklist: IDeleteCustomerBlacklistService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    try {
      await deleteCustomerBlacklist(body);
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
