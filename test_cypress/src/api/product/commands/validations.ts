import { Category, Product } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getProductId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateProductDocument = (response: Product.ProductId, request: Product.Request, categoryId: Category.Id) => {
  const id = response?.productId;

  cy.log('Get product document', id)
    .findProductDocumentById(id)
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
    .findProductDocumentById(productId)
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
    .findProductDocumentById(productId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const validateProductResponse = (nestedPath: string = '') => (response: Product.Response, document: Product.Document) => {
  const { productId, brand, measurement, unitOfMeasurement, fullName, ...internal } = response;

  expect(productId, `${nestedPath}productId`).to.equal(getProductId(document));
  expect(brand, `${nestedPath}brand`).to.equal(document.brand);
  expect(measurement, `${nestedPath}measurement`).to.equal(document.measurement);
  expect(unitOfMeasurement, `${nestedPath}unitOfMeasurement`).to.equal(document.unitOfMeasurement);
  expect(fullName, `${nestedPath}fullName`).to.equal(document.fullName);
  expectEmptyObject(internal, nestedPath);
};

const validateNestedProductResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateProductResponse>>) => validateProductResponse(nestedPath)(...rest);

const validateProductListResponse = (responses: Product.GroupedResponse[], documents: (Category.FullName &{products: Product.Document[]})[]) => {
  documents.forEach(({ fullName, products }) => {
    const response = responses.find(r => r.fullName === fullName);
    response.products.forEach((productResponse, index) => {
      cy.validateNestedProductResponse(`[${index}].`, productResponse, products[index]);
    });
  });
};

export const setProductValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateProductDocument,
    validateProductResponse: validateProductResponse(),
    validateProductListResponse,
  });

  Cypress.Commands.addAll({
    validateProductDeleted,
    validateProductReassigned,
    validateNestedProductResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProductDeleted: CommandFunction<typeof validateProductDeleted>;
      validateProductReassigned: CommandFunction<typeof validateProductReassigned>;
      validateNestedProductResponse: CommandFunction<typeof validateNestedProductResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProductDocument: CommandFunctionWithPreviousSubject<typeof validateProductDocument>;
      validateProductResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateProductResponse>>;
      validateProductListResponse: CommandFunctionWithPreviousSubject<typeof validateProductListResponse>;
    }
  }
}
