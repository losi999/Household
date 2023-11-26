import { Category, Product } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

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

export const setProductRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateProduct,
    requestUpdateProduct,
    requestDeleteProduct,
    requestMergeProducts,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestCreateProduct: CommandFunctionWithPreviousSubject<typeof requestCreateProduct>;
      requestMergeProducts: CommandFunctionWithPreviousSubject<typeof requestMergeProducts>;
      requestUpdateProduct: CommandFunctionWithPreviousSubject<typeof requestUpdateProduct>;
      requestDeleteProduct: CommandFunctionWithPreviousSubject<typeof requestDeleteProduct>;
    }
  }
}
