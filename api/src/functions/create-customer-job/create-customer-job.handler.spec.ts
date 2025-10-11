import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-customer-job/create-customer-job.handler';
import { ICreateCustomerJobService } from '@household/api/functions/create-customer-job/create-customer-job.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Create customer job handler', () => {
  let mockCreateCustomerJobService: MockBusinessService<ICreateCustomerJobService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateCustomerJobService = jest.fn();
    handlerFunction = handler(mockCreateCustomerJobService);
  });

  const body = customerDataFactory.jobRequest();
  const customerId = customerDataFactory.id();
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
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
      body,
      customerId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockCreateCustomerJobService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCustomerJobService, {
      body,
      customerId,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });
});
