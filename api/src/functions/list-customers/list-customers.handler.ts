
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCustomersService } from '@household/api/functions/list-customers/list-customers.service';
import { Customer } from '@household/shared/types/types';

export default (listCustomers: IListCustomersService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let customers: Customer.Response[];
    try {
      customers = await listCustomers();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(customers);
  };
};
