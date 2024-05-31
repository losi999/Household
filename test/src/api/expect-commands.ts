import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { JSONSchema7 } from 'json-schema';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { isLocalhost } from '@household/test/api/utils';

const expectOkResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(200);
  return response.body as Cypress.ChainableResponseBody;
};

const expectCreatedResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(201);
  return response.body as Cypress.ChainableResponseBody;
};

const expectNoContentResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(204);
  return response.body as Cypress.ChainableResponseBody;
};

const expectBadRequestResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(400);
  return response.body as Cypress.ChainableResponseBody;
};

const expectUnauthorizedResponse = (response: Cypress.Response<any>) => {
  if (!isLocalhost()) {
    expect(response.status).to.equal(401);
  }
  return response.body as Cypress.ChainableResponseBody;
};

const expectForbiddenResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(403);
  return response.body as Cypress.ChainableResponseBody;
};

const expectNotFoundResponse = (response: Cypress.Response<any>) => {
  expect(response.status).to.equal(404);
  return response.body as Cypress.ChainableResponseBody;
};

const expectMessage = (body: any, message: string) => {
  expect(body.message).to.equal(message);
};

const expectValidResponseSchema = (body: object, schema: JSONSchema7) => {
  const validation = validatorService.validate(body, schema);
  expect(validation, 'Response schema validation').to.be.undefined;
  return cy.wrap(body, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const expectRequiredProperty = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('required');
  return body;
};

const expectDependentRequiredProperty = (body: any, propertyName: string, requestPart: string, ...dependingProperties: string[]) => {
  expect(body[requestPart]).to.contain(`${propertyName} is present`).to.contain(`must have propert${dependingProperties.length > 1 ? 'ies' : 'y'} ${dependingProperties.join(', ')}`);
  return body;
};

const expectAdditionalProperty = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('additional');
  return body;
};

const expectWrongPropertyType = (body: any, propertyName: string, propertyType: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain(propertyType);
  return body;
};

const expectWrongPropertyFormat = (body: any, propertyName: string, propertyFormat: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('format').to.contain(propertyFormat);
  return body;
};

const expectWrongPropertyPattern = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('pattern');
  return body;
};

const expectWrongEnumValue = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('allowed values');
  return body;
};

const expectTooShortProperty = (body: any, propertyName: string, minLength: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('fewer').to.contain(minLength);
  return body;
};

const expectTooLongProperty = (body: any, propertyName: string, maxLength: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('longer').to.contain(maxLength);
  return body;
};

const expectTooSmallNumberProperty = (body: any, propertyName: string, minimum: number, isExclusive: boolean, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain(isExclusive ? '>' : '>=').to.contain(minimum);
  return body;
};

const expectTooLargeNumberProperty = (body: any, propertyName: string, maximum: number, isExclusive: boolean, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain(isExclusive ? '<' : '<=').to.contain(maximum);
  return body;
};

const expectTooEarlyDateProperty = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('>');
  return body;
};

const expectTooFewItemsProperty = (body: any, propertyName: string, minItems: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('fewer').to.contain(minItems);
  return body;
};

export const setExpectCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    expectOkResponse,
    expectCreatedResponse,
    expectNoContentResponse,
    expectBadRequestResponse,
    expectUnauthorizedResponse,
    expectForbiddenResponse,
    expectNotFoundResponse,
    expectValidResponseSchema,
    expectRequiredProperty,
    expectDependentRequiredProperty,
    expectAdditionalProperty,
    expectWrongPropertyType,
    expectWrongPropertyFormat,
    expectWrongPropertyPattern,
    expectWrongEnumValue,
    expectTooShortProperty,
    expectTooLongProperty,
    expectTooSmallNumberProperty,
    expectTooLargeNumberProperty,
    expectTooEarlyDateProperty,
    expectTooFewItemsProperty,
    expectMessage,
  });
};

declare global {
  namespace Cypress {
    interface ChainableResponse extends Chainable {
      expectOkResponse: CommandFunctionWithPreviousSubject<typeof expectOkResponse>;
      expectCreatedResponse: CommandFunctionWithPreviousSubject<typeof expectCreatedResponse>;
      expectNoContentResponse: CommandFunctionWithPreviousSubject<typeof expectNoContentResponse>;
      expectBadRequestResponse: CommandFunctionWithPreviousSubject<typeof expectBadRequestResponse>;
      expectUnauthorizedResponse: CommandFunctionWithPreviousSubject<typeof expectUnauthorizedResponse>;
      expectForbiddenResponse: CommandFunctionWithPreviousSubject<typeof expectForbiddenResponse>;
      expectNotFoundResponse: CommandFunctionWithPreviousSubject<typeof expectNotFoundResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      expectValidResponseSchema: CommandFunctionWithPreviousSubject<typeof expectValidResponseSchema>;
      expectAdditionalProperty: CommandFunctionWithPreviousSubject<typeof expectAdditionalProperty>;
      expectRequiredProperty: CommandFunctionWithPreviousSubject<typeof expectRequiredProperty>;
      expectDependentRequiredProperty: CommandFunctionWithPreviousSubject<typeof expectDependentRequiredProperty>;
      expectWrongPropertyType: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyType>;
      expectWrongPropertyFormat: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyFormat>;
      expectWrongPropertyPattern: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyPattern>;
      expectWrongEnumValue: CommandFunctionWithPreviousSubject<typeof expectWrongEnumValue>;
      expectTooShortProperty: CommandFunctionWithPreviousSubject<typeof expectTooShortProperty>;
      expectTooLongProperty: CommandFunctionWithPreviousSubject<typeof expectTooLongProperty>;
      expectTooSmallNumberProperty: CommandFunctionWithPreviousSubject<typeof expectTooSmallNumberProperty>;
      expectTooLargeNumberProperty: CommandFunctionWithPreviousSubject<typeof expectTooLargeNumberProperty>;
      expectTooEarlyDateProperty: CommandFunctionWithPreviousSubject<typeof expectTooEarlyDateProperty>;
      expectTooFewItemsProperty: CommandFunctionWithPreviousSubject<typeof expectTooFewItemsProperty>;
      expectMessage: CommandFunctionWithPreviousSubject<typeof expectMessage>;
    }
  }
}
