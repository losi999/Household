import { Category, Product } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ICategoryService } from '@household/shared/services/category-service';
import { getCategoryId, getProductId } from '@household/shared/common/utils';

type RelatedDocumentOperation = 'parentReassign' | 'productRemoval';

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

const validateCategoryDocument = (response: Category.CategoryId, request: Category.Request, parentCategory?: Category.Document, product?: Product.Document) => {
  const id = response?.categoryId;

  cy.log('Get category document', id)
    .getCategoryDocumentById(id)
    .should((document) => {
      expect(getCategoryId(document), 'id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.categoryType, 'categoryType').to.equal(request.categoryType);
      expect(document.fullName, 'fullName').to.equal(parentCategory ? `${parentCategory.fullName}:${request.name}` : request.name);
      expect(document.parentCategory?.name, 'parentCategory.name').to.equal(parentCategory?.name);
      expect(document.parentCategory?.fullName, 'parentCategory.fullName').to.equal(parentCategory?.fullName);
      expect(document.parentCategory?.categoryType, 'parentCategory.categoryType').to.equal(parentCategory?.categoryType);
      expect(getCategoryId(document.parentCategory), 'parentCategory.categoryId').to.equal(getCategoryId(parentCategory));
      if (product) {
        expect(document.products).to.contain(getProductId(product));
      }
    });
};

const validateCategoryResponse = (response: Category.Response, document: Category.Document, parentCategory?: Category.Document) => {
  expect(response.categoryId, 'categoryId').to.equal(getCategoryId(document));
  expect(response.name, 'name').to.equal(document.name);
  expect(response.categoryType, 'categoryType').to.equal(document.categoryType);
  expect(response.fullName, 'fullName').to.equal(document.fullName);
  expect(response.parentCategory?.name, 'parentCategory.name').to.equal(parentCategory?.name);
  expect(response.parentCategory?.fullName, 'parentCategory.fullName').to.equal(parentCategory?.fullName);
  expect(response.parentCategory?.categoryType, 'parentCategory.categoryType').to.equal(parentCategory?.categoryType);
  expect(response.parentCategory?.categoryId, 'parentCategory.categoryId').to.equal(getCategoryId(parentCategory));
};

const validateCategoryListResponse = (responses: Category.Response[], documents: Category.Document[]) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.categoryId === getCategoryId(document));
    validateCategoryResponse(response, document);
  });
};

const validateCategoryDeleted = (categoryId: Category.Id) => {
  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const compareCategoryDocuments = (original: Category.Document, updated: Category.Document, operation: RelatedDocumentOperation) => {
  expect(getCategoryId(original), 'id').to.equal(getCategoryId(updated));
  expect(original.name, 'name').to.equal(updated.name);
  expect(original.categoryType, 'categoryType').to.equal(updated.categoryType);

  if (operation !== 'parentReassign') {
    expect(original.fullName, 'fullName').to.equal(updated.fullName);
    expect(getCategoryId(original.parentCategory), 'parentCategory.categoryId').to.equal(getCategoryId(updated.parentCategory));
  }

  if (operation !== 'productRemoval') {
    expect(original.products).to.equal(updated.products);
  }
};

const validateCategoryParentReassign = (originalDocument: Category.Document, parentCategoryId?: Category.Id) => {
  const categoryId = getCategoryId(originalDocument);
  let parentCategoryDocument: Category.Document;

  cy.log('Get parent category document', parentCategoryId)
    .getCategoryDocumentById(parentCategoryId)
    .should((document) => {
      parentCategoryDocument = document;
    })
    .log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      compareCategoryDocuments(originalDocument, document, 'parentReassign');
      if (parentCategoryDocument) {
        expect(document.fullName, 'fullName').to.equal(`${parentCategoryDocument.fullName}:${document.name}`);
        expect(getCategoryId(document.parentCategory), 'parentCategory').to.equal(getCategoryId(parentCategoryDocument));
      } else {
        expect(document.fullName, 'fullName').to.equal(document.name);
        expect(!!document.parentCategory, 'parentCategory').to.be.false;
      }
    });
};

const validateProductRemoval = (originalDocument: Category.Document, removedProductIds: Product.Id[]) => {
  const categoryId = getCategoryId(originalDocument);

  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((document) => {
      compareCategoryDocuments(originalDocument, document, 'productRemoval');
      removedProductIds.forEach(productId => {
        expect(document.products, 'products').to.not.contain(productId);
      });
    });
};

const saveCategoryDocument = (...params: Parameters<ICategoryService['saveCategory']>) => {
  return cy.task<Category.Document>('saveCategory', ...params);
};

const getCategoryDocumentById = (...params: Parameters<ICategoryService['getCategoryById']>) => {
  return cy.task<Category.Document>('getCategoryById', ...params);
};

export const setCategoryCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateCategory,
    requestUpdateCategory,
    requestDeleteCategory,
    requestGetCategory,
    requestGetCategoryList,
    requestMergeCategories,
    validateCategoryDocument,
    validateCategoryResponse,
    validateCategoryListResponse,
  });

  Cypress.Commands.addAll({
    saveCategoryDocument,
    getCategoryDocumentById,
    validateCategoryDeleted,
    validateCategoryParentReassign,
    validateProductRemoval,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCategoryDeleted: CommandFunction<typeof validateCategoryDeleted>;
      validateCategoryParentReassign: CommandFunction<typeof validateCategoryParentReassign>;
      validateProductRemoval: CommandFunction<typeof validateProductRemoval>;
      saveCategoryDocument: CommandFunction<typeof saveCategoryDocument>;
      getCategoryDocumentById: CommandFunction<typeof getCategoryDocumentById>;
    }

    interface ChainableRequest extends Chainable {
      requestCreateCategory: CommandFunctionWithPreviousSubject<typeof requestCreateCategory>;
      requestGetCategory: CommandFunctionWithPreviousSubject<typeof requestGetCategory>;
      requestUpdateCategory: CommandFunctionWithPreviousSubject<typeof requestUpdateCategory>;
      requestDeleteCategory: CommandFunctionWithPreviousSubject<typeof requestDeleteCategory>;
      requestGetCategoryList: CommandFunctionWithPreviousSubject<typeof requestGetCategoryList>;
      requestMergeCategories: CommandFunctionWithPreviousSubject<typeof requestMergeCategories>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCategoryDocument: CommandFunctionWithPreviousSubject<typeof validateCategoryDocument>;
      validateCategoryResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryResponse>;
      validateCategoryListResponse: CommandFunctionWithPreviousSubject<typeof validateCategoryListResponse>;
    }
  }
}
