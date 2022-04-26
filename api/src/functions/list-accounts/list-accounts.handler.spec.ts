import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-accounts/list-accounts.handler';
import { IListAccountsService } from '@household/api/functions/list-accounts/list-accounts.service';
import { createAccountResponse } from '@household/shared/common/test-data-factory';

describe('List accounts handler', () => {
  let mockListAccountsService: MockBusinessService<IListAccountsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListAccountsService = jest.fn();
    handlerFunction = handler(mockListAccountsService);
  });

  const accounts = [createAccountResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListAccountsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListAccountsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListAccountsService.mockResolvedValue(accounts);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListAccountsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(accounts);
    expect.assertions(3);
  });
});
