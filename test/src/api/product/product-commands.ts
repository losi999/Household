import { Category, Product } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IProductService } from '@household/shared/services/product-service';
import { getProductId } from '@household/shared/common/utils';

const requestCreateProduct = (idToken: string, product: Product.Request, categoryId: Category.Id) => {
  return cy.request({
    body: product,
    method: 'POST',
    url: `/product/v1/categories/${categoryId}/products`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateProduct = (idToken: string, productId: Product.Id, product: Product.Request) => {
  return cy.request({
    body: product,
    method: 'PUT',
    url: `/product/v1/products/${productId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteProduct = (idToken: string, productId: Product.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/product/v1/products/${productId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestMergeProducts = (idToken: string, productId: Product.Id, sourceProductIds: Product.Id[]) => {
  return cy.request({
    body: sourceProductIds,
    method: 'POST',
    url: `/product/v1/products/${productId}/merge`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

// const requestGetProduct = (idToken: string, productId: Product.Id) => {
//   return cy.request({
//     method: 'GET',
//     url: `/product/v1/products/${productId}`,
//     headers: {
//       Authorization: idToken,
//     },
//     failOnStatusCode: false,
//   }) as Cypress.ChainableResponse;
// };

// const requestGetProductList = (idToken: string) => {
//   return cy.request({
//     method: 'GET',
//     url: '/product/v1/products',
//     headers: {
//       Authorization: idToken,
//     },
//     failOnStatusCode: false,
//   }) as Cypress.ChainableResponse;
// };

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

// const validateProductResponse = (response: Product.Response, document: Product.Document) => {
//   expect(response.productId, 'productId').to.equal(getProductId(document));
//   expect(response.name, 'name').to.equal(document.name);
//   expect(response.description, 'description').to.equal(document.description);
// };

const validateProductDeleted = (productId: Product.Id) => {
  cy.log('Get product document', productId)
    .getProductDocumentById(productId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const saveProductDocument = (...params: Parameters<IProductService['saveProduct']>) => {
  return cy.task<Product.Document>('saveProduct', ...params);
};

const getProductDocumentById = (...params: Parameters<IProductService['getProductById']>) => {
  return cy.task<Product.Document>('getProductById', ...params);
};

export const setProductCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateProduct,
    requestUpdateProduct,
    requestDeleteProduct,
    requestMergeProducts,
    // requestGetProduct,
    // requestGetProductList,
    validateProductDocument,
    // validateProductResponse,
  });

  Cypress.Commands.addAll({
    validateProductDeleted,
    saveProductDocument,
    getProductDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProductDeleted: CommandFunction<typeof validateProductDeleted>;
      saveProductDocument: CommandFunction<typeof saveProductDocument>;
      getProductDocumentById: CommandFunction<typeof getProductDocumentById>;
    }

    interface ChainableRequest extends Chainable {
      requestCreateProduct: CommandFunctionWithPreviousSubject<typeof requestCreateProduct>;
      requestMergeProducts: CommandFunctionWithPreviousSubject<typeof requestMergeProducts>;
      // requestGetProduct: CommandFunctionWithPreviousSubject<typeof requestGetProduct>;
      requestUpdateProduct: CommandFunctionWithPreviousSubject<typeof requestUpdateProduct>;
      requestDeleteProduct: CommandFunctionWithPreviousSubject<typeof requestDeleteProduct>;
      // requestGetProductList: CommandFunctionWithPreviousSubject<typeof requestGetProductList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProductDocument: CommandFunctionWithPreviousSubject<typeof validateProductDocument>;
      // validateProductResponse: CommandFunctionWithPreviousSubject<typeof validateProductResponse>;
    }
  }
}
