import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.handler';
import { IListTransactionsByFileService } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.service';
import { createDraftTransactionResponse, createFileId } from '@household/shared/common/test-data-factory';

describe('List transactions by transaction handler', () => {
  let mockListTransactionsByTransactionService: MockBusinessService<IListTransactionsByFileService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListTransactionsByTransactionService = jest.fn();
    handlerFunction = handler(mockListTransactionsByTransactionService);
  });

  const fileId = createFileId();
  const transactions = [createDraftTransactionResponse()];
  const handlerEvent = {
    pathParameters: {
      fileId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListTransactionsByTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListTransactionsByTransactionService, {
      fileId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListTransactionsByTransactionService.mockResolvedValue(transactions);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListTransactionsByTransactionService, {
      fileId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(transactions);
    expect.assertions(3);
  });

  it('should respond with success with pagination', async () => {
    mockListTransactionsByTransactionService.mockResolvedValue(transactions);
    const pageNumber = 2;
    const pageSize = 13;

    const response = await handlerFunction({
      ...handlerEvent,
      queryStringParameters: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      },
    }, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListTransactionsByTransactionService, {
      fileId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(transactions);
    expect.assertions(3);
  });
});

