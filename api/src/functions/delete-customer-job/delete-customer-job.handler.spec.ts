import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-customer-job/delete-customer-job.handler';
import { IDeleteCustomerJobService } from '@household/api/functions/delete-customer-job/delete-customer-job.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Create customer job handler', () => {
  let mockCreateCustomerJobService: MockBusinessService<IDeleteCustomerJobService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateCustomerJobService = jest.fn();
    handlerFunction = handler(mockCreateCustomerJobService);
  });

  const jobName = 'job to delete';
  const customerId = customerDataFactory.id();
  const handlerEvent = {
    pathParameters: {
      jobName,
      customerId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateCustomerJobService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCustomerJobService, {
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockCreateCustomerJobService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCustomerJobService, {
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
