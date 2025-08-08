import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetCustomerService } from '@household/api/functions/get-customer/get-customer.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Customer } from '@household/shared/types/types';

export default (getCustomer: IGetCustomerService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { customerId } = castPathParameters(event);

    let customer: Customer.Response;
    try {
      customer = await getCustomer({
        customerId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(customer);
  };
};
