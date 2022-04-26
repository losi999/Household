import { default as handler } from '@household/api/handlers/api-request-validator.handler';
import { IValidatorService } from '@household/shared/services/validator-service';

describe('API request validator handler', () => {
  let mockValidatorService: IValidatorService;
  let mockValidate: jest.Mock;

  beforeEach(() => {
    mockValidate = jest.fn();
    mockValidatorService = new (jest.fn<IValidatorService, undefined[]>(() => ({
      validate: mockValidate,
    })))();

  });

  it('should respond with HTTP 400 if request is not valid', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;

    const validationError = 'This is a validation error';
    mockValidate.mockReturnValue(validationError);

    try {
      handler(mockValidatorService)({
        body: {},
      })(handlerEvent);
    } catch (error) {
      expect(error.statusCode).toEqual(400);
      expect(JSON.parse(error.body)).toEqual({
        body: validationError,
      });
    }

  });

  it('should call inner handler if request is valid', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;

    mockValidate.mockReturnValue(undefined);

    const result = handler(mockValidatorService)({
      body: {},
    })(handlerEvent);

    expect(result).toEqual(handlerEvent);
  });
});
