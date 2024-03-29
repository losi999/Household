import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as schema } from '@household/test/api/schemas/category-response-list';
import { Category, Product } from '@household/shared/types/types';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { v4 as uuid } from 'uuid';

describe('GET /category/v1/categories', () => {
  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDocumentConverter.create({
      body: {
        name: `category 1-${uuid()}`,
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    categoryDocument2 = categoryDocumentConverter.create({
      body: {
        name: `category 2-${uuid()}`,
        categoryType: 'inventory',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    productDocument = productDocumentConverter.create({
      body: {
        brand: `tesco-${uuid()}`,
        unitOfMeasurement: 'g',
        measurement: 300,
      },
      category: categoryDocument1,
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
        .saveProductDocument(productDocument)
        .authenticate(1)
        .requestGetCategoryList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryListResponse([
          categoryDocument1,
          categoryDocument2,
        ], [productDocument]);
    });
  });
});
