import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateCustomerService } from '@household/api/functions/create-customer/create-customer.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';
import { Customer } from '@household/shared/types/types';

export default (createCustomer: ICreateCustomerService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let customerId: Customer.Id;
    try {
      customerId = await createCustomer({
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
