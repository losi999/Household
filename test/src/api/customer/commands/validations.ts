import { Customer } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCustomerId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateCustomerDocument = (response: Customer.CustomerId, request: Customer.Request) => {
  const id = response?.customerId;

  cy.log('Get customer document', id)
    .findCustomerDocumentById(id)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(id);
      const { name, ...internal } = document;

      expect(name, 'name').to.equal(request.name);
      expectRemainingProperties(internal);
    });
};

const validateCustomerResponse = (response: Customer.Response, document: Customer.Document) => {
  const { customerId, name, ...empty } = response;

  expect(customerId, 'customerId').to.equal(getCustomerId(document));
  expect(name, 'name').to.equal(document.name);
  expectEmptyObject(empty);
};

const validateInCustomerListResponse = (responses: Customer.Response[], document: Customer.Document) => {
  const response = responses.find(r => r.customerId === getCustomerId(document));
  validateCustomerResponse(response, document);
  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateCustomerDeleted = (customerId: Customer.Id) => {
  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setCustomerValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCustomerDocument,
    validateCustomerResponse,
    validateInCustomerListResponse,
  });

  Cypress.Commands.addAll({
    validateCustomerDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCustomerDeleted: CommandFunction<typeof validateCustomerDeleted>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCustomerDocument: CommandFunctionWithPreviousSubject<typeof validateCustomerDocument>;
      validateCustomerResponse: CommandFunctionWithPreviousSubject<typeof validateCustomerResponse>;
      validateInCustomerListResponse: CommandFunctionWithPreviousSubject<typeof validateInCustomerListResponse>;
    }
  }
}
