
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCustomersService } from '@household/api/functions/list-customers/list-customers.service';
import { Responses } from '@household/shared/types/responses';

export default (listCustomers: IListCustomersService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let customers: Responses.Customer[];
    try {
      customers = await listCustomers();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(customers);
  };
};
