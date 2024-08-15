import { default as schema } from '@household/test/api/schemas/category-response-list';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';

describe('GET /category/v1/categories', () => {
  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });

    categoryDocument2 = categoryDataFactory.document();

    productDocument = productDataFactory.document({
      category: categoryDocument1,
    });
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
