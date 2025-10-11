import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IUpdateCustomerJobService } from '@household/api/functions/update-customer-job/update-customer-job.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (updateCustomerJob: IUpdateCustomerJobService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { customerId } = castPathParameters(event);
    const body = JSON.parse(event.body);

    try {
      await updateCustomerJob({
        body,
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
