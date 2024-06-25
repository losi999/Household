import { Category, Product } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { expectRemainingProperties } from '@household/test/api/utils';

const validateProductDocument = (response: Product.ProductId, request: Product.Request, categoryId: Category.Id) => {
  const id = response?.productId;

  cy.log('Get product document', id)
    .getProductDocumentById(id)
    .should((document) => {
      expect(getProductId(document), 'id').to.equal(id);
      const { brand, measurement, unitOfMeasurement, fullName, category, ...internal } = document;

      expect(brand, 'brand').to.equal(request.brand);
      expect(measurement, 'measurement').to.equal(request.measurement);
      expect(unitOfMeasurement, 'unitOfMeasurement').to.equal(request.unitOfMeasurement);
      expect(fullName, 'fullName').to.equal(`${request.brand} ${request.measurement} ${request.unitOfMeasurement}`);
      expect(category, 'category').to.equal(categoryId);
      expectRemainingProperties(internal);
    });
};

const validateProductReassigned = (originalProduct: Product.Document, newCategoryId: Category.Id) => {
  const productId = getProductId(originalProduct);
  cy.log('Get product document', productId)
    .getProductDocumentById(productId)
    .should((document) => {
      const { brand, category, fullName, measurement, unitOfMeasurement, ...internal } = document;

      expect(brand, 'brand').to.equal(originalProduct.brand);
      expect(fullName, 'fullName').to.equal(originalProduct.fullName);
      expect(measurement, 'measurement').to.equal(originalProduct.measurement);
      expect(unitOfMeasurement, 'unitOfMeasurement').to.equal(originalProduct.unitOfMeasurement);
      expect(category, 'category').to.equal(newCategoryId);
      expectRemainingProperties(internal);
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
    validateProductReassigned,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProductDeleted: CommandFunction<typeof validateProductDeleted>;
      validateProductReassigned: CommandFunction<typeof validateProductReassigned>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProductDocument: CommandFunctionWithPreviousSubject<typeof validateProductDocument>;
    }
  }
}
