import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { User } from '@household/test/types';
import { expect as baseExpect, APIResponse, APIRequestContext, MatcherReturnType } from '@playwright/test';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { JSONSchema7 } from 'json-schema';

export type ApiFixture = {
  userType: User;
  authenticate(userType: User): Promise<string>;
  loggedRequest: Pick<APIRequestContext, 'get' | 'post' | 'put' | 'delete'>;
};

type RequestPart = 'body' | 'queryStringParameters' | 'pathParameters' | 'multiValueQueryStringParameters';

export const test = baseTest.extend<ApiFixture>({
  userType: undefined,
  loggedRequest: async ({ request, logApiCall }, use) => {
    const loggedRequest: Pick<APIRequestContext, 'get' | 'post' | 'put' | 'delete'> = {
      async get(url, options) {
        const response = await request.get(url, options);

        await logApiCall('get', url, response, options);

        return response;
      },
      async post(url, options) {
        const response = await request.post(url, options);

        await logApiCall('post', url, response, options);

        return response;
      },
      async put(url, options) {
        const response = await request.put(url, options);

        await logApiCall('put', url, response, options);

        return response;
      },
      async delete(url, options) {
        const response = await request.delete(url, options);

        await logApiCall('delete', url, response, options);

        return response;
      },
    };
    await use(loggedRequest);
  },  
  authenticate: async ({ request }, use) => {
    const authenticate = async (userType: User) => {
      const authRes = await request.post(`${process.env.BASE_URL}/user/v1/login`, {
        data: {
          email: `losonczil+${userType}@gmail.com`,
          password: process.env.PASSWORD,
        },
      });
      return (await authRes.json()).idToken;
    };

    await use(authenticate);
  },
});

const matchRegexp = async (received: APIResponse, requestPart: RequestPart, regexp: string): Promise<MatcherReturnType> => {
  const response = await received.json();
  const hasError = new RegExp(regexp).test(response[requestPart]);
  return {
    message: () => `expected response to match pattern '${regexp}', but got ${JSON.stringify(response)}`,
    pass: hasError,
  };  
};

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
    const regexp = `${propertyName} must match pattern`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveRequiredPropertyValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const regexp = `must have required property '${propertyName}'`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveDependentRequiredPropertyValidationError(received: APIResponse, requestPart: RequestPart, dependingPropertyName: string, ...dependentPropertyNames: string[]) {
    const regexp = `must have property${dependentPropertyNames.length === 1 ? '' : 'ies'} ${dependentPropertyNames.join(', ')} when property ${dependingPropertyName} is present`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveAdditionalPropertiesValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, additionalPropertyName: string) {
    const regexp = `${propertyName} must NOT have additional properties ${additionalPropertyName}`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveWrongTypeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, expectedType: string) {
    const regexp = `${propertyName} must be ([^,]*,)*${expectedType}([^,]*,)*`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveTooShortValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minLength: number) {
    const regexp = `${propertyName} must NOT have fewer than ${minLength} characters`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveTooLongValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxLength: number) {
    const regexp = `${propertyName} must NOT have more than ${maxLength} characters`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveExclusiveTooSmallValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minValue: number) {
    const regexp = `${propertyName} must be > ${minValue}`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveTooSmallValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minValue: number) {
    const regexp = `${propertyName} must be >= ${minValue}`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveExclusiveTooLargeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxValue: number) {
    const regexp = `${propertyName} must be < ${maxValue}`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveTooLargeValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxValue: number) {
    const regexp = `${propertyName} must be <= ${maxValue}`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveTooFewItemsValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, minItems: number) {
    const regexp = `${propertyName} must NOT have fewer than ${minItems} items`;
    return matchRegexp(received, requestPart, regexp);  
  },
  async toHaveTooManyItemsValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, maxItems: number) {
    const regexp = `${propertyName} must NOT have more than ${maxItems} items`;
    return matchRegexp(received, requestPart, regexp);  
  },
  async toHaveEnumValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const regexp = `${propertyName} must be equal to one of the allowed values`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveWrongFormatValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, expectedFormat: string) {
    const regexp = `${propertyName} must match format "${expectedFormat}"`;
    return matchRegexp(received, requestPart, regexp);
  },
  async toHaveConstantValueValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string) {
    const regexp = `${propertyName} must be equal to constant`;
    return matchRegexp(received, requestPart, regexp);  
  },
  async toHaveTooEarlyDateValidationError(received: APIResponse, requestPart: RequestPart, propertyName: string, isExclusive: boolean) {
    const regexp = `${propertyName} should be ${isExclusive ? '>' : '>='}`;
    return matchRegexp(received, requestPart, regexp); 
  },
});
