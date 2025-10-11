import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCustomerJobService } from '@household/api/functions/delete-customer-job/delete-customer-job.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteCustomerJob: IDeleteCustomerJobService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { customerId } = castPathParameters(event);

    try {
      await deleteCustomerJob({
        customerId,
        name: decodeURIComponent(event.pathParameters.jobName),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
