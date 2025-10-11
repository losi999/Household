import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateCustomerJobService } from '@household/api/functions/create-customer-job/create-customer-job.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (createCustomerJob: ICreateCustomerJobService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { customerId } = castPathParameters(event);

    try {
      await createCustomerJob({
        body,
        customerId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse();
  };
};
