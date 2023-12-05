import { Category } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateCategory = (idToken: string, category: Category.Request) => {
  return cy.request({
    body: category,
    method: 'POST',
    url: '/category/v1/categories',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateCategory = (idToken: string, categoryId: Category.Id, category: Category.Request) => {
  return cy.request({
    body: category,
    method: 'PUT',
    url: `/category/v1/categories/${categoryId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteCategory = (idToken: string, categoryId: Category.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/category/v1/categories/${categoryId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCategory = (idToken: string, categoryId: Category.Id) => {
  return cy.request({
    method: 'GET',
    url: `/category/v1/categories/${categoryId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCategoryList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/category/v1/categories',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestMergeCategories = (idToken: string, categoryId: Category.Id, sourceCategoryIds: Category.Id[]) => {
  return cy.request({
    body: sourceCategoryIds,
    method: 'POST',
    url: `/category/v1/categories/${categoryId}/merge`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setCategoryRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateCategory,
    requestUpdateCategory,
    requestDeleteCategory,
    requestGetCategory,
    requestGetCategoryList,
    requestMergeCategories,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateCategory: CommandFunctionWithPreviousSubject<typeof requestCreateCategory>;
      requestGetCategory: CommandFunctionWithPreviousSubject<typeof requestGetCategory>;
      requestUpdateCategory: CommandFunctionWithPreviousSubject<typeof requestUpdateCategory>;
      requestDeleteCategory: CommandFunctionWithPreviousSubject<typeof requestDeleteCategory>;
      requestGetCategoryList: CommandFunctionWithPreviousSubject<typeof requestGetCategoryList>;
      requestMergeCategories: CommandFunctionWithPreviousSubject<typeof requestMergeCategories>;
    }
  }
}
