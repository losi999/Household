import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateCustomerService } from '@household/api/functions/update-customer/update-customer.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateCustomer: IUpdateCustomerService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { customerId } = castPathParameters(event);

    try {
      await updateCustomer({
        customerId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      customerId,
    });
  };
};
