import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { User } from '@household/test/types';
import { test as baseTest, expect as baseExpect, APIResponse } from '@playwright/test';
import { JSONSchema7 } from 'json-schema';

export type ApiFixture = {
  userType: User;
  authenticate(userType: User): Promise<string>;
};

type RequestPart = 'body' | 'queryStringParameters' | 'pathParameters' | 'multiValueQueryStringParameters';

export const test = baseTest.extend<ApiFixture>({
  userType: undefined,
  authenticate: async ({ request }, use) => {
    const authenticate = async (userType: User) => {
      const authRes = await request.post(`${process.env.BASE_URL}/user/v1/login`, {
        data: {
          email: `losonczil+${userType}@gmail.com`,
          password: 'Password1!',
        },
      });
      return (await authRes.json()).idToken;
    };

    await use(authenticate);
  },
});

export const expect = baseExpect.extend({
  toBeOkResponse(received: APIResponse) {
    return {
      message: () => `expected response to be ok, but got status: ${received.status()}`,
      pass: received.status() === 200,
    };
  },
  toBeUnauthorizedResponse(received: APIResponse) {
    return {
      message: () => `expected response to be unauthorized, but got status: ${received.status()}`,
      pass: received.status() === 401,
    };
  },
  toBeForbiddenResponse(received: APIResponse) {
    return {
      message: () => `expected response to be forbidden, but got status: ${received.status()}`,
      pass: received.status() === 403,
    };
  },
  toBeCreatedResponse(received: APIResponse) {
    return {
      message: () => `expected response to be created, but got status: ${received.status()}`,
      pass: received.status() === 201,
    };
  },
  toBeNotFoundResponse(received: APIResponse) {
    return {
      message: () => `expected response to be not found, but got status: ${received.status()}`,
      pass: received.status() === 404,
    };
  },
  toBeNoContentResponse(received: APIResponse) {
    return {
      message: () => `expected response to be no content, but got status: ${received.status()}`,
      pass: received.status() === 204,
    };
  },
  toBeBadRequestResponse(received: APIResponse) {
    return {
      message: () => `expected response to be bad request, but got status: ${received.status()}`,
      pass: received.status() === 400,
    };
  },
  async toHaveMessage(received: APIResponse, expectedMessage: string) {
    const message = (await received.json()).message;
    return {
      message: () => `expected response message to be '${expectedMessage}', but got '${message}'`,
      pass: message === expectedMessage,
    };
  },
  async toMatchSchema(received: APIResponse, schema: JSONSchema7) {
    const validation = validatorService.validate(await received.json(), schema);
    return {
      message: () => `expected response to match schema, but got validation error: ${validation}`,
      pass: validation === undefined,
    };
  },
  async toHavePatternValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must match pattern`).test(response[requestPart]);
    return {
      message: () => `expected response to have pattern validation error for property '${propertyName}' in ${requestPart}, but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveRequiredPropertyValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const response = await received.json();
    const hasError = new RegExp(`must have required property '${propertyName}'`).test(response[requestPart]);
    return {
      message: () => `expected response to have required property validation error for property '${propertyName}' in ${requestPart}, but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveAdditionalPropertiesValidationError(received: APIResponse, requestPart: RequestPart, additionalPropertyName: string) {
    const response = await received.json();
    const hasError = new RegExp(`must NOT have additional properties ${additionalPropertyName}`).test(response[requestPart]);
    return {
      message: () => `expected response to have additional properties validation error for property '${additionalPropertyName}' in ${requestPart}, but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveWrongTypeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, expectedType: string) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be ([^,]*,)*${expectedType}([^,]*,)*`).test(response[requestPart]);
    return {
      message: () => `expected response to have wrong type validation error for property '${propertyName}' in ${requestPart} with expected type '${expectedType}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveTooShortValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minLength: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must NOT have fewer than ${minLength} characters`).test(response[requestPart]);
    return {
      message: () => `expected response to have too short validation error for property '${propertyName}' in ${requestPart} with min length '${minLength}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveTooLongValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxLength: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must NOT have more than ${maxLength} characters`).test(response[requestPart]);
    return {
      message: () => `expected response to have too long validation error for property '${propertyName}' in ${requestPart} with max length '${maxLength}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveExclusiveTooSmallValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minValue: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be > ${minValue}`).test(response[requestPart]);
    return {
      message: () => `expected response to have too small validation error for property '${propertyName}' in ${requestPart} with min value '${minValue}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveTooSmallValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minValue: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be >= ${minValue}`).test(response[requestPart]);
    return {
      message: () => `expected response to have too small validation error for property '${propertyName}' in ${requestPart} with min value '${minValue}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveExclusiveTooLargeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxValue: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be < ${maxValue}`).test(response[requestPart]);
    return {
      message: () => `expected response to have too large validation error for property '${propertyName}' in ${requestPart} with max value '${maxValue}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveTooLargeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxValue: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be <= ${maxValue}`).test(response[requestPart]);
    return {
      message: () => `expected response to have too large validation error for property '${propertyName}' in ${requestPart} with max value '${maxValue}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveTooFewItemsValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minItems: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must NOT have fewer than ${minItems} items`).test(response[requestPart]);
    return {
      message: () => `expected response to have too few items validation error for property '${propertyName}' in ${requestPart} with min items '${minItems}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };  
  },
  async toHaveTooManyItemsValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxItems: number) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must NOT have more than ${maxItems} items`).test(response[requestPart]);
    return {
      message: () => `expected response to have too many items validation error for property '${propertyName}' in ${requestPart} with max items '${maxItems}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };  
  },
  async toHaveEnumValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be equal to one of the allowed values`).test(response[requestPart]);
    return {
      message: () => `expected response to have enum validation error for property '${propertyName}' in ${requestPart}, but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveWrongFormatValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, expectedFormat: string) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must match format "${expectedFormat}"`).test(response[requestPart]);
    return {
      message: () => `expected response to have wrong format validation error for property '${propertyName}' in ${requestPart} with expected format '${expectedFormat}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    };
  },
  async toHaveConstantValueValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be equal to constant`).test(response[requestPart]);
    return {
      message: () => `expected response to have constant value validation error for property '${propertyName}' in ${requestPart}, but got ${JSON.stringify(response)}`,
      pass: hasError,
    };  
  },
  async toHaveTooEarlyDateValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, isExclusive: boolean) {
    const response = await received.json();
    const hasError = new RegExp(`${propertyName} must be ${isExclusive ? '>' : '>='} now`).test(response[requestPart]);
    return {
      message: () => `expected response to have too early date validation error for property '${propertyName}' in ${requestPart} with exclusivity '${isExclusive}', but got ${JSON.stringify(response)}`,
      pass: hasError,
    }; 
  },
});
