import { entries, getProductId } from '@household/shared/common/utils';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
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

test.describe('POST /product/v1/products', () => {
  let request: Requests.Product;
  let genericProductDocument: Documents.GenericProduct;
  let specificProductDocument: Documents.SpecificProduct;

  test.beforeEach(async () => {
    request = productDataFactory.request.generic();

    genericProductDocument = productDataFactory.document.generic();
    specificProductDocument = productDataFactory.document.specific({
      genericProduct: genericProductDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateProduct }) => {
      const res = await requestCreateProduct(request);
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
          const res = await requestCreateProduct(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create', () => {
          test('generic product', async ({ requestCreateProduct, findProductById }) => {
            
            const res = await requestCreateProduct(request);
            expect(res).toBeCreatedResponse();

            const { productId } = (await res.json()) as Api.Product.ProductId;
            expect(request).toHaveBeenSavedAsProductDocument(await findProductById(productId));
          });

          test('specific product', async ({ requestCreateProduct, saveProduct, findProductById }) => {
            request = productDataFactory.request.specific({
              parentProductId: getProductId(genericProductDocument),
            });

            await saveProduct(genericProductDocument);
            const res = await requestCreateProduct(request);
            expect(res).toBeCreatedResponse();

            const { productId } = (await res.json()) as Api.Product.ProductId;
            expect(request).toHaveBeenSavedAsProductDocument(await findProductById(productId), genericProductDocument);
          });

          test('variant product', async ({ requestCreateProduct, saveProducts, findProductById }) => {
            request = productDataFactory.request.variant({
              parentProductId: getProductId(specificProductDocument),
            });

            await saveProducts(genericProductDocument, specificProductDocument);
            const res = await requestCreateProduct(request);
            expect(res).toBeCreatedResponse();

            const { productId } = (await res.json()) as Api.Product.ProductId;
            expect(request).toHaveBeenSavedAsProductDocument(await findProductById(productId), specificProductDocument);
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.generic({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.generic({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.generic({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different product', async ({ requestCreateProduct, saveProduct }) => {
              request = productDataFactory.request.generic({
                name: genericProductDocument.name,
              });

              await saveProduct(genericProductDocument);
              
              const res = await requestCreateProduct(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate product name');
            });
          });

          test.describe('if measurement', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                measurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'measurement');
            });

            test('is not number', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                measurement: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'measurement', 'number');
            });

            test('is too small', async ({ requestCreateProduct }) => {              
              const res = await requestCreateProduct(productDataFactory.request.specific({
                measurement: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'measurement', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                unitOfMeasurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                unitOfMeasurement: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                unitOfMeasurement: <any>'not-valid', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });

          test.describe('if parentProductId', () => {
            test('is not a valid mongo id', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific({
                parentProductId: 'not-mongo-id' as any,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'parentProductId');
            });

            test('does not belong to any product', async ({ requestCreateProduct }) => {
              const res = await requestCreateProduct(productDataFactory.request.specific());
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });

            test.describe('belongs to a', () => {
              let variantProductDocument: Documents.VariantProduct;

              test.beforeEach(() => {
                variantProductDocument = productDataFactory.document.variant({
                  specificProduct: specificProductDocument,
                  genericProduct: genericProductDocument,
                });
              });

              test('specific product when creating specific product', async ({ requestCreateProduct, saveProduct }) => {
                request = productDataFactory.request.specific({
                  parentProductId: getProductId(specificProductDocument),
                });

                await saveProduct(specificProductDocument);
                const res = await requestCreateProduct(request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "generic" when creating "specific" product');
              });
              
              test('variant product when creating specific product', async ({ requestCreateProduct, saveProduct }) => {
                request = productDataFactory.request.specific({
                  parentProductId: getProductId(variantProductDocument),
                });

                await saveProduct(variantProductDocument);
                const res = await requestCreateProduct(request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "generic" when creating "specific" product');
              });
              
              test('generic product when creating variant product', async ({ requestCreateProduct, saveProduct }) => {
                request = productDataFactory.request.variant({
                  parentProductId: getProductId(genericProductDocument),
                });

                await saveProduct(genericProductDocument);
                const res = await requestCreateProduct(request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "specific" when creating "variant" product');
              });

              test('variant product when creating variant product', async ({ requestCreateProduct, saveProduct }) => {
                request = productDataFactory.request.variant({
                  parentProductId: getProductId(variantProductDocument),
                });

                await saveProduct(variantProductDocument);
                const res = await requestCreateProduct(request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "specific" when creating "variant" product');
              });
            });
          });
        });
      }
    });
  });
});
