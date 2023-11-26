import { Product } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getProductId } from '@household/shared/common/utils';

const validateProductDocument = (response: Product.ProductId, request: Product.Request) => {
  const id = response?.productId;

  cy.log('Get product document', id)
    .getProductDocumentById(id)
    .should((document) => {
      expect(getProductId(document), 'id').to.equal(id);
      expect(document.brand, 'brand').to.equal(request.brand);
      expect(document.measurement, 'measurement').to.equal(request.measurement);
      expect(document.unitOfMeasurement, 'unitOfMeasurement').to.equal(request.unitOfMeasurement);
    });
};

const validateProductDeleted = (productId: Product.Id) => {
  cy.log('Get product document', productId)
    .getProductDocumentById(productId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setProductValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateProductDocument,
  });

  Cypress.Commands.addAll({
    validateProductDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProductDeleted: CommandFunction<typeof validateProductDeleted>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProductDocument: CommandFunctionWithPreviousSubject<typeof validateProductDocument>;
    }
  }
}
