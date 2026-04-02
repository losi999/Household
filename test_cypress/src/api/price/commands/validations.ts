import { Price } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getPriceId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validatePriceDocument = (response: Price.PriceId, request: Price.Request) => {
  const id = response?.priceId;

  cy.log('Get price document', id)
    .findPriceDocumentById(id)
    .should((document) => {
      const { name, amount, unitOfMeasurement, isArchived, ...internal } = document;

      expect(getPriceId(document), 'id').to.equal(id);
      expect(name, 'name').to.equal(request.name);
      expect(amount, 'amount').to.equal(request.amount);
      expect(isArchived, 'isArchived').to.equal(false);
      expect(unitOfMeasurement, 'unitOfMeasurement').to.equal(request.unitOfMeasurement);
      expectRemainingProperties(internal);
    });
};

const validatePriceResponse = (response: Price.Response, document: Price.Document) => {
  const { priceId, name, amount, unitOfMeasurement, ...internal } = response;

  expect(priceId, 'priceId').to.equal(getPriceId(document));
  expect(name, 'name').to.equal(document.name);
  expect(amount, 'amount').to.equal(document.amount);
  expect(unitOfMeasurement, 'unitOfMeasurement').to.equal(document.unitOfMeasurement);
  expectEmptyObject(internal);
};

const validateInPriceListResponse = (responses: Price.Response[], document: Price.Document) => {
  const response = responses.find(r => r.priceId === getPriceId(document));
  validatePriceResponse(response, document);

  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateNotInPriceListResponse = (responses: Price.Response[], priceId: Price.Id) => {
  expect(responses.map(r => r.priceId)).to.not.include(priceId);

  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validatePriceDeleted = (priceId: Price.Id) => {
  cy.log('Get price document', priceId)
    .findPriceDocumentById(priceId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const validatePriceArchived = (originalDocument: Price.Document) => {
  const priceId = getPriceId(originalDocument);
  cy.log('Get price document', priceId)
    .findPriceDocumentById(priceId)
    .should((document) => {
      const { amount, isArchived, name, unitOfMeasurement, ...internal } = document;

      expect(isArchived, 'isArchived').to.equal(true);
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(name, 'name').to.equal(originalDocument.name);
      expect(unitOfMeasurement, 'unitOfMeasurement').to.equal(originalDocument.unitOfMeasurement);
      expectRemainingProperties(internal);
    });
};

export const setPriceValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validatePriceDocument,
    validatePriceResponse,
    validateInPriceListResponse,
    validateNotInPriceListResponse,
  });

  Cypress.Commands.addAll({
    validatePriceDeleted,
    validatePriceArchived,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validatePriceDeleted: CommandFunction<typeof validatePriceDeleted>;
      validatePriceArchived: CommandFunction<typeof validatePriceArchived>;
    }

    interface ChainableResponseBody extends Chainable {
      validatePriceDocument: CommandFunctionWithPreviousSubject<typeof validatePriceDocument>;
      validatePriceResponse: CommandFunctionWithPreviousSubject<typeof validatePriceResponse>;
      validateInPriceListResponse: CommandFunctionWithPreviousSubject<typeof validateInPriceListResponse>;
      validateNotInPriceListResponse: CommandFunctionWithPreviousSubject<typeof validateNotInPriceListResponse>;
    }
  }
}
