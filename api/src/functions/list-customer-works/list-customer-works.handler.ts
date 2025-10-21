import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCustomerWorksService } from '@household/api/functions/list-customer-works/list-customer-works.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Calendar } from '@household/shared/types/types';

export default (listCustomerWorks: IListCustomerWorksService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { customerId } = castPathParameters(event);

    let calendarEntries: Calendar.Entry.ResponseBase[];
    try {
      calendarEntries = await listCustomerWorks({
        customerId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(calendarEntries);
  };
};
