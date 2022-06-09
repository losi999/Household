import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { JSONSchema7 } from 'json-schema';
import { validatorService } from '@household/shared/dependencies/services/validator-service';

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
  expect(response.status).to.equal(401);
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
};

const expectWrongPropertyType = (body: any, propertyName: string, propertyType: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain(propertyType);
};

const expectWrongPropertyFormat = (body: any, propertyName: string, propertyFormat: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('format').to.contain(propertyFormat);
};

const expectWrongPropertyPattern = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('pattern');
};

const expectWrongEnumValue = (body: any, propertyName: string, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('allowed values');
};

const expectTooShortProperty = (body: any, propertyName: string, minLength: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('fewer').to.contain(minLength);
};

const expectTooLongProperty = (body: any, propertyName: string, maxLength: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('longer').to.contain(maxLength);
};

const expectTooSmallNumberProperty = (body: any, propertyName: string, minimum: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('>=').to.contain(minimum);
};

const expectTooLargeNumberProperty = (body: any, propertyName: string, maximum: number, requestPart: string) => {
  expect(body[requestPart]).to.contain(propertyName).to.contain('<=').to.contain(maximum);
};

export const setExpectCommands = () => {
  Cypress.Commands.add<any>('expectOkResponse', {
    prevSubject: true,
  }, expectOkResponse);
  Cypress.Commands.add<any>('expectCreatedResponse', {
    prevSubject: true,
  }, expectCreatedResponse);
  Cypress.Commands.add<any>('expectNoContentResponse', {
    prevSubject: true,
  }, expectNoContentResponse);
  Cypress.Commands.add<any>('expectBadRequestResponse', {
    prevSubject: true,
  }, expectBadRequestResponse);
  Cypress.Commands.add<any>('expectUnauthorizedResponse', {
    prevSubject: true,
  }, expectUnauthorizedResponse);
  Cypress.Commands.add<any>('expectForbiddenResponse', {
    prevSubject: true,
  }, expectForbiddenResponse);
  Cypress.Commands.add<any>('expectNotFoundResponse', {
    prevSubject: true,
  }, expectNotFoundResponse);

  Cypress.Commands.add<any>('expectValidResponseSchema', {
    prevSubject: true,
  }, expectValidResponseSchema);
  Cypress.Commands.add<any>('expectRequiredProperty', {
    prevSubject: true,
  }, expectRequiredProperty);
  Cypress.Commands.add<any>('expectWrongPropertyType', {
    prevSubject: true,
  }, expectWrongPropertyType);
  Cypress.Commands.add<any>('expectWrongPropertyFormat', {
    prevSubject: true,
  }, expectWrongPropertyFormat);
  Cypress.Commands.add<any>('expectWrongPropertyPattern', {
    prevSubject: true,
  }, expectWrongPropertyPattern);
  Cypress.Commands.add<any>('expectWrongEnumValue', {
    prevSubject: true,
  }, expectWrongEnumValue);
  Cypress.Commands.add<any>('expectTooShortProperty', {
    prevSubject: true,
  }, expectTooShortProperty);
  Cypress.Commands.add<any>('expectTooLongProperty', {
    prevSubject: true,
  }, expectTooLongProperty);
  Cypress.Commands.add<any>('expectTooSmallNumberProperty', {
    prevSubject: true,
  }, expectTooSmallNumberProperty);
  Cypress.Commands.add<any>('expectTooLargeNumberProperty', {
    prevSubject: true,
  }, expectTooLargeNumberProperty);
  Cypress.Commands.add<any>('expectMessage', {
    prevSubject: true,
  }, expectMessage);
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
      expectRequiredProperty: CommandFunctionWithPreviousSubject<typeof expectRequiredProperty>;
      expectWrongPropertyType: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyType>;
      expectWrongPropertyFormat: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyFormat>;
      expectWrongPropertyPattern: CommandFunctionWithPreviousSubject<typeof expectWrongPropertyPattern>;
      expectWrongEnumValue: CommandFunctionWithPreviousSubject<typeof expectWrongEnumValue>;
      expectTooShortProperty: CommandFunctionWithPreviousSubject<typeof expectTooShortProperty>;
      expectTooLongProperty: CommandFunctionWithPreviousSubject<typeof expectTooLongProperty>;
      expectTooSmallNumberProperty: CommandFunctionWithPreviousSubject<typeof expectTooSmallNumberProperty>;
      expectTooLargeNumberProperty: CommandFunctionWithPreviousSubject<typeof expectTooLargeNumberProperty>;
      expectMessage: CommandFunctionWithPreviousSubject<typeof expectMessage>;
    }
  }
}
