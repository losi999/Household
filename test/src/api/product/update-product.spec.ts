import { entries, getCategoryId, getProductId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { allowUsers } from '@household/test/utils';
import { test, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { categoryService, productService } from '@household/test/dependencies';

const expect = mergeExpects(productApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('PUT /product/v1/products/{productId}', () => {
  let request: Product.Request;
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  test.beforeEach(async () => {
    request = productDataFactory.request();

    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    productDocument = productDataFactory.document({
      category: categoryDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateProduct }) => {
      const res = await requestUpdateProduct(productDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateProduct }) => {
          const res = await requestUpdateProduct(productDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update product', () => {
          test('with complete body', async ({ requestUpdateProduct }) => {
            await categoryService.saveCategory(categoryDocument);
            await productService.saveProduct(productDocument);
            const res = await requestUpdateProduct(getProductId(productDocument), request);
            expect(res).toBeCreatedResponse();

            const { productId } = (await res.json()) as Product.ProductId;
            expect(request).toBeStoredInDatabase(await productService.findProductById(productId), getCategoryId(categoryDocument));
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
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });
                  
          test.describe('if brand', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                brand: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'brand');
            });

            test('is not string', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                brand: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'brand', 'string');
            });

            test('is too short', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                brand: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'brand', 1);
            });

            test('is already in use by a different product', async ({ requestUpdateProduct }) => {
              const duplicateProductDocument = productDataFactory.document({
                body: request,
                category: categoryDocument,
              });

              await productService.saveProduct(productDocument);
              await productService.saveProduct(duplicateProductDocument);
              const res = await requestUpdateProduct(getProductId(productDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate product name');
            });
          });

          test.describe('if measurement', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                measurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'measurement');
            });

            test('is not number', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                measurement: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'measurement', 'number');
            });

            test('is too small', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                measurement: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'measurement', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                unitOfMeasurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                unitOfMeasurement: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                unitOfMeasurement: <any>'not-valid', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });

          test.describe('if productId', () => {
            test('is not mongo id', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'productId');
            });

            test('does not belong to any product', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
