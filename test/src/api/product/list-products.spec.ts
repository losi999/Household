import { default as schema } from '@household/test/api/schemas/product-response-list';
import { Category, Product } from '@household/shared/types/types';
import { productDataFactory } from './data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';

describe('GET /product/v1/products', () => {
  let productDocument1: Product.Document;
  let productDocument2: Product.Document;
  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });
    categoryDocument2 = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });

    productDocument1 = productDataFactory.document({
      category: categoryDocument1,
    });
    productDocument2 = productDataFactory.document({
      category: categoryDocument2,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProductList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of products', () => {
      cy.saveProductDocuments([
        productDocument1,
        productDocument2,
      ])
        .saveCategoryDocuments([
          categoryDocument1,
          categoryDocument2,
        ])
        .authenticate(1)
        .requestGetProductList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateProductListResponse([
          {
            fullName: categoryDocument1.name,
            products: [productDocument1],
          },
          {
            fullName: categoryDocument2.name,
            products: [productDocument2],
          },
        ]);
    });
  });
});
