import { groupedResponseList as schema } from '@household/shared/schemas/product';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test as productApiTest, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(productApiExpect, apiExpect);

const permissionMap = forbidUsers();

const test = mergeTests(productApiTest, categoryDbTest, productDbTest);

test.describe('GET /product/v1/products', () => {
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
        test('should get a list of products', async ({ requestListProducts, saveProducts }) => {
          const genericProduct = productDataFactory.document.generic();
          const specificProduct = productDataFactory.document.specific({
            genericProduct,
          });
          const variantProduct = productDataFactory.document.variant({
            genericProduct,
            specificProduct,
          });
          await saveProducts(genericProduct);
          const res = await requestListProducts();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);

          expect(res).toContainProductTree({
            product: genericProduct,
            children: [
              {
                product: specificProduct,
                children: [variantProduct],
              },
            ],
          });
        });
      }
    });
  });
});
