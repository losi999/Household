import { default as handler } from '@household/api/handlers/api-request-validator.handler';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { IValidatorService } from '@household/shared/services/validator-service';

describe('API request validator handler', () => {
  let mockValidatorService: MockService<IValidatorService>;

  beforeEach(() => {
    mockValidatorService = createMockService('validate');

  });

  it('should respond with HTTP 400 if request is not valid', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;

    const validationError = 'This is a validation error';
    mockValidatorService.functions.validate.mockReturnValue(validationError);

    try {
      handler(mockValidatorService.service)({
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

    mockValidatorService.functions.validate.mockReturnValue(undefined);

    const result = handler(mockValidatorService.service)({
      body: {},
    })(handlerEvent);

    expect(result).toEqual(handlerEvent);
  });
});
