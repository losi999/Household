import { default as schema } from '@household/test/schemas/product-response-list';
import { Category, Product } from '@household/shared/types/types';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';
import { entries, getCategoryId } from '@household/shared/common/utils';

import { test, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { categoryService, productService } from '@household/test/dependencies';

const expect = mergeExpects(productApiExpect, apiExpect);

const permissionMap = forbidUsers();

test.describe('GET /product/v1/products', () => {
  let productDocument1: Product.Document;
  let productDocument2: Product.Document;
  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;

  test.beforeEach(async () => {
    categoryDocument1 = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
    categoryDocument2 = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    productDocument1 = productDataFactory.document({
      category: categoryDocument1,
    });
    productDocument2 = productDataFactory.document({
      category: categoryDocument2,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListProducts }) => {
      const res = await requestListProducts();
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestListProducts }) => {
          const res = await requestListProducts();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of products', async ({ requestListProducts }) => {
          await productService.saveProducts(productDocument1, productDocument2);
          await categoryService.saveCategories(categoryDocument1, categoryDocument2);
          const res = await requestListProducts();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);

          expect(res).toContainMatchingProductDocument(productDocument1, getCategoryId(categoryDocument1));
          expect(res).toContainMatchingProductDocument(productDocument2, getCategoryId(categoryDocument2));
        });
      }
    });
  });
});
