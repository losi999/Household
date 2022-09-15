import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';

describe('GET /category/v1/categories', () => {
  const category1: Category.Request = {
    name: 'category 1',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  const category2: Category.Request = {
    name: 'category 2',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDocumentConverter.create({
      body: category1,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    categoryDocument2 = categoryDocumentConverter.create({
      body: category2,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetCategoryList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of categories', () => {
      cy.saveCategoryDocument(categoryDocument1)
        .saveCategoryDocument(categoryDocument2)
        .authenticate(1)
        .requestGetCategoryList()
        .expectOkResponse();
      // .expectValidResponseSchema(schema);
    });
  });
});
