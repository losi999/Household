import { responseList as schema } from '@household/shared/schemas/product';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { productApiTest, productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { mergeTests } from '@playwright/test';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(productApiTest, categoryDbTest, productDbTest);

test.describe('GET /product/v1/products', () => {
  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListProducts }) => {
      const res = await requestListProducts();
      productApiExpect(res).toBeUnauthorizedResponse();
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
          productApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of products', async ({ requestListProducts, saveProducts }) => {
          const genericProduct = productDataFactory.document.generic();
          const specificProduct = productDataFactory.document.specific({
            genericProduct,
          });
          const variantProduct = productDataFactory.document.variant({
            genericProduct,
            specificProduct,
          });
          await saveProducts(genericProduct, specificProduct, variantProduct);
          const res = await requestListProducts();
          productApiExpect(res).toBeOkResponse();
          productApiExpect(res).toMatchSchema(schema);

          // every product is followed by its children
          productApiExpect(res).toContainMatchingProductDocument(genericProduct);
          productApiExpect(res).toContainMatchingProductDocument(specificProduct);
          productApiExpect(res).toContainMatchingProductDocument(variantProduct);
        });
      }
    });
  });
});
