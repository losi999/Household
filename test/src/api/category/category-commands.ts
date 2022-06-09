import { Category } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ICategoryService } from '@household/shared/services/category-service';

const categoryTask = <T extends keyof ICategoryService>(name: T, params: Parameters<ICategoryService[T]>) => {
  return cy.task(name, ...params);
};

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

const requestUpdateCategory = (idToken: string, categoryId: Category.IdType, category: Category.Request) => {
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

const requestDeleteCategory = (idToken: string, categoryId: Category.IdType) => {
  return cy.request({
    method: 'DELETE',
    url: `/category/v1/categories/${categoryId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetCategory = (idToken: string, categoryId: Category.IdType) => {
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

const validateCategoryDocument = (response: Category.Id, request: Category.Request, parentCategory?: Category.Document) => {
  const id = response?.categoryId;

  cy.log('Get category document', id)
    .categoryTask('getCategoryById', [id])
    .should((document: Category.Document) => {
      expect(document._id.toString(), 'id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.categoryType, 'categoryType').to.equal(request.categoryType);
      expect(document.fullName, 'fullName').to.equal(parentCategory ? `${parentCategory.fullName}:${request.name}` : request.name);
      expect(document.parentCategory, 'parentCategory').to.equal(parentCategory?._id.toString());
    });
};

const validateCategoryResponse = (response: Category.Response, document: Category.Document, parentCategory?: Category.Document) => {
  expect(response.categoryId, 'categoryId').to.equal(document._id.toString());
  expect(response.name, 'name').to.equal(document.name);
  expect(response.categoryType, 'categoryType').to.equal(document.categoryType);
  expect(response.fullName, 'fullName').to.equal(document.fullName);
  expect(response.parentCategory?.name, 'parentCategory.name').to.equal(parentCategory?.name);
  expect(response.parentCategory?.fullName, 'parentCategory.fullName').to.equal(parentCategory?.fullName);
  expect(response.parentCategory?.categoryType, 'parentCategory.categoryType').to.equal(parentCategory?.categoryType);
  expect(response.parentCategory?.categoryId, 'parentCategory.categoryId').to.equal(parentCategory?._id.toString());
};

const validateCategoryDeleted = (categoryId: Category.IdType) => {
  cy.log('Get category document', categoryId)
    .categoryTask('getCategoryById', [categoryId])
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setCategoryCommands = () => {
  Cypress.Commands.addAll<any, string>({
    prevSubject: true,
  }, {
    requestCreateCategory,
    requestUpdateCategory,
    requestDeleteCategory,
    requestGetCategory,
    requestGetCategoryList,
  });

  Cypress.Commands.addAll({
    prevSubject: true,
  }, {
    validateCategoryDocument,
    validateCategoryResponse,
  });

  Cypress.Commands.addAll({
    categoryTask,
    validateCategoryDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCategoryDeleted: CommandFunction<typeof validateCategoryDeleted>;
      categoryTask: CommandFunction<typeof categoryTask>
    }

    interface ChainableRequest extends Chainable {
      requestCreateCategory: CommandFunctionWithPreviousSubject<typeof requestCreateCategory>;
      requestGetCategory: CommandFunctionWithPreviousSubject<typeof requestGetCategory>;
      requestUpdateCategory: CommandFunctionWithPreviousSubject<typeof requestUpdateCategory>;
      requestDeleteCategory: CommandFunctionWithPreviousSubject<typeof requestDeleteCategory>;
      requestGetCategoryList: CommandFunctionWithPreviousSubject<typeof requestGetCategoryList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCategoryDocument: CommandFunctionWithPreviousSubject<typeof validateCategoryDocument>;
      validateCategoryResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryResponse>;
    }
  }
}
