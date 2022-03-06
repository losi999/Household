import { default as handler } from '@household/api/handlers/api-request-validator-handler';
import { IValidatorService } from '@household/shared/services/validator-service';

describe('API request validator handler', () => {
  let mockValidatorService: IValidatorService;
  let mockValidate: jest.Mock;
  let mockInnerHandler: jest.Mock;
  beforeEach(() => {
    mockValidate = jest.fn();
    mockValidatorService = new (jest.fn<IValidatorService, undefined[]>(() => ({
      validate: mockValidate, 
    })))();

    mockInnerHandler = jest.fn();
  });

  it('should respond with HTTP 400 if request is not valid', async () => {
    const handlerEvent = {
      body: '{}', 
    } as AWSLambda.APIGatewayProxyEvent;
    const validationError = 'This is a validation error';
    mockValidate.mockReturnValue(validationError);
    const response = await handler(mockValidatorService)({
      body: {}, 
    })(mockInnerHandler)(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual({
      body: validationError, 
    });
    expect(mockInnerHandler).not.toHaveBeenCalled();
  });

  it('should call inner handler if request is valid', async () => {
    const handlerEvent = {
      body: '{}', 
    } as AWSLambda.APIGatewayProxyEvent;

    mockValidate.mockReturnValue(undefined);
    const statusCode = 418;
    const body = 'I\'m a teapot';
    mockInnerHandler.mockResolvedValue({
      statusCode,
      body,
    });
    const response = await handler(mockValidatorService)({
      body: {}, 
    })(mockInnerHandler)(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;

    expect(response.statusCode).toEqual(statusCode);
    expect(response.body).toEqual(body);
  });
});
