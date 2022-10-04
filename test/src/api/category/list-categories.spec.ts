import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as schema } from '@household/test/api/schemas/category-response-list';
import { Category, Product } from '@household/shared/types/types';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { getCategoryId } from '@household/shared/common/utils';

describe('GET /category/v1/categories', () => {
  const category1: Category.Request = {
    name: 'category 1',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  const category2: Category.Request = {
    name: 'category 2',
    categoryType: 'inventory',
    parentCategoryId: undefined,
  };

  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDocumentConverter.create({
      body: category1,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    categoryDocument2 = categoryDocumentConverter.create({
      body: category2,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    productDocument = productDocumentConverter.create({
      brand: 'tesco',
      unitOfMeasurement: 'g',
      measurement: 300,
    },
    Cypress.env('EXPIRES_IN'), true);
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
        .saveProductDocument({
          document: productDocument,
          categoryId: getCategoryId(categoryDocument1),
        })
        .authenticate(1)
        .requestGetCategoryList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryListResponse([
          categoryDocument1,
          categoryDocument2,
        ]);
    });
  });
});
