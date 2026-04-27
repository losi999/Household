import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCustomerService } from '@household/api/functions/delete-customer/delete-customer.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteCustomer: IDeleteCustomerService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { customerId } = castPathParameters(event);

    try {
      await deleteCustomer({
        customerId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
