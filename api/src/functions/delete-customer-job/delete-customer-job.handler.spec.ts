import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-customer-job/delete-customer-job.handler';
import { IDeleteCustomerJobService } from '@household/api/functions/delete-customer-job/delete-customer-job.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Delete customer job handler', () => {
  let mockDeleteCustomerJobService: MockBusinessService<IDeleteCustomerJobService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCustomerJobService = jest.fn();
    handlerFunction = handler(mockDeleteCustomerJobService);
  });

  const jobName = 'job to delete';
  const customerId = testDataFactory.customer.id();
  const handlerEvent = {
    pathParameters: {
      jobName,
      customerId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteCustomerJobService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerJobService, {
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCustomerJobService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerJobService, {
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
