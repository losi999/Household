import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-customer-job/update-customer-job.handler';
import { IUpdateCustomerJobService } from '@household/api/functions/update-customer-job/update-customer-job.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Update customer job handler', () => {
  let mockUpdateCustomerJobService: MockBusinessService<IUpdateCustomerJobService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateCustomerJobService = jest.fn();
    handlerFunction = handler(mockUpdateCustomerJobService);
  });

  const customerId = customerDataFactory.id();
  const body = customerDataFactory.jobRequest();
  const jobName = 'job name';
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      customerId,
      jobName,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockUpdateCustomerJobService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCustomerJobService, {
      body,
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateCustomerJobService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCustomerJobService, {
      body,
      customerId,
      name: jobName,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
