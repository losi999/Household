import { entries, getCategoryId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { allowUsers } from '@household/test/utils';

import { test as productApiTest, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(productApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(productApiTest, categoryDbTest, productDbTest);

test.describe('POST product/v1/products', () => {
  let request: Product.Request;
  let categoryDocument: Category.Document;

  test.beforeEach(async () => {
    request = productDataFactory.request();

    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateProduct }) => {
      const res = await requestCreateProduct(request, getCategoryId(categoryDocument));
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
        test('should return forbidden', async ({ requestCreateProduct }) => {
          const res = await requestCreateProduct(request, getCategoryId(categoryDocument));
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create product', () => {
          test('with complete body', async ({ requestCreateProduct, saveCategory, findProductById }) => {
            await saveCategory(categoryDocument);
            const res = await requestCreateProduct(request, getCategoryId(categoryDocument));
            expect(res).toBeCreatedResponse();

            const { productId } = (await res.json()) as Product.ProductId;
            expect(request).toHaveBeenSavedAsProductDocument(await findProductById(productId), getCategoryId(categoryDocument));
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct({
                ...request,
                extraProperty: 'extra',
              } as any, categoryDataFactory.id());
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if brand', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                brand: undefined, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'brand');
            });

            test('is not string', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                brand: <any>1, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'brand', 'string');
            });

            test('is too short', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                brand: '', 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'brand', 1);
            });

            test('is already in use by a different product', async ({ requestCreateProduct, saveCategory, saveProduct }) => {
              const productDocument = productDataFactory.document({
                body: request,
                category: categoryDocument,
              });

              await saveProduct(productDocument);
              await saveCategory(categoryDocument);
              const res = await requestCreateProduct(request, getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate product name');
            });
          });

          test.describe('if measurement', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                measurement: undefined, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'measurement');
            });

            test('is not number', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                measurement: <any>'1', 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'measurement', 'number');
            });

            test('is too small', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                measurement: 0, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'measurement', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                unitOfMeasurement: undefined, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                unitOfMeasurement: <any>1, 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request({
                unitOfMeasurement: <any>'not-valid', 
              }), getCategoryId(categoryDocument));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });

          test.describe('if categoryId', () => {
            test('is not a valid mongo id', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(request, categoryDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });

            test('does not belong to any category', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(request, categoryDataFactory.id());
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No category found');
            });
          });
        });
      }
    });
  });
});
