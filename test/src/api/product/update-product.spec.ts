import { entries, getProductId } from '@household/shared/common/utils';
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

test.describe('PUT /product/v1/products/{productId}', () => {
  let request: Requests.Product;
  let genericProductDocument: Documents.GenericProduct;
  let specificProductDocument: Documents.SpecificProduct;
  let originalProductDocument: Documents.Product;

  test.beforeEach(async () => {
    request = productDataFactory.request.generic();

    originalProductDocument = productDataFactory.document.generic();

    genericProductDocument = productDataFactory.document.generic();
    specificProductDocument = productDataFactory.document.specific({
      genericProduct: genericProductDocument,
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
        test.describe('should update', () => {
          test.describe('generic product', () => {
            test('to specific product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.specific({
                parentProductId: getProductId(genericProductDocument),
              });

              await saveProducts(originalProductDocument, genericProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)), genericProductDocument);
            });

            test('to variant product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.variant({
                parentProductId: getProductId(specificProductDocument),
              });

              await saveProducts(originalProductDocument, specificProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)), specificProductDocument);
            });
          });

          test.describe('specific product', () => {
            originalProductDocument = productDataFactory.document.specific({
              genericProduct: genericProductDocument,
            });

            test('to generic product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.generic();

              await saveProducts(originalProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)));
            });

            test('to variant product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.variant({
                parentProductId: getProductId(specificProductDocument),
              });

              await saveProducts(originalProductDocument, specificProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)), specificProductDocument);
            });
          });

          test.describe('variant product', () => {
            originalProductDocument = productDataFactory.document.variant({
              genericProduct: genericProductDocument,
              specificProduct: specificProductDocument,
            });

            test('to generic product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.generic();

              await saveProducts(originalProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)));
            });

            test('to specific product', async ({ requestUpdateProduct, saveProducts, findProductById }) => {
              request = productDataFactory.request.specific({
                parentProductId: getProductId(genericProductDocument),
              });

              await saveProducts(originalProductDocument, genericProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeNoContentResponse();
              expect(request).toHaveBeenSavedAsProductDocument(await findProductById(getProductId(originalProductDocument)), genericProductDocument);
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if productType', () => {
            test('is to be updated on generic product which has children', async ({ requestUpdateProduct, saveProducts }) => {
              await saveProducts(genericProductDocument, specificProductDocument);
              
              const res = await requestUpdateProduct(getProductId(genericProductDocument), productDataFactory.request.specific());
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Product type cannot be updated if there are child products');
            });

            test('is to be updated on specific product which has children', async ({ requestUpdateProduct, saveProducts }) => {
              const variantProductDocument = productDataFactory.document.variant({
                specificProduct: specificProductDocument,
                genericProduct: genericProductDocument,
              });

              await saveProducts(genericProductDocument, specificProductDocument, variantProductDocument);
              
              const res = await requestUpdateProduct(getProductId(specificProductDocument), productDataFactory.request.generic());
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Product type cannot be updated if there are child products');
            });
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
                  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
                  
          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different product', async ({ requestUpdateProduct, saveProducts }) => {
              request = productDataFactory.request.generic({
                name: genericProductDocument.name,
              });

              await saveProducts(originalProductDocument, genericProductDocument);
              const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate product name');
            });
          });

          test.describe('if measurement', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                measurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'measurement');
            });

            test('is not number', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                measurement: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'measurement', 'number');
            });

            test('is too small', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                measurement: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'measurement', 0);
            });
          });

          test.describe('if unitOfMeasurement', () => {
            test('is missing from body', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                unitOfMeasurement: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'unitOfMeasurement');
            });

            test('is not string', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                unitOfMeasurement: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'unitOfMeasurement', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                unitOfMeasurement: <any>'not-valid', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'unitOfMeasurement');
            });
          });
          
          test.describe('if parentProductId', () => {
            test('is not a valid mongo id', async ({ requestUpdateProduct }) => {
              const res = await requestUpdateProduct(productDataFactory.id(), productDataFactory.request.specific({
                parentProductId: 'not-mongo-id' as any,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'parentProductId');
            });
          
            test('does not belong to any product', async ({ requestUpdateProduct, saveProduct }) => {
              await saveProduct(originalProductDocument);

              const res = await requestUpdateProduct(getProductId(originalProductDocument), productDataFactory.request.specific());
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
            
              test('specific product when creating specific product', async ({ requestUpdateProduct, saveProducts }) => {
                request = productDataFactory.request.specific({
                  parentProductId: getProductId(specificProductDocument),
                });
            
                await saveProducts(originalProductDocument, specificProductDocument);
                const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "generic" when creating "specific" product');
              });
                          
              test('variant product when creating specific product', async ({ requestUpdateProduct, saveProducts }) => {
                request = productDataFactory.request.specific({
                  parentProductId: getProductId(variantProductDocument),
                });
            
                await saveProducts(originalProductDocument, variantProductDocument);
                const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "generic" when creating "specific" product');
              });
                          
              test('generic product when creating variant product', async ({ requestUpdateProduct, saveProducts }) => {
                request = productDataFactory.request.variant({
                  parentProductId: getProductId(genericProductDocument),
                });
            
                await saveProducts(originalProductDocument, genericProductDocument);
                const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "specific" when creating "variant" product');
              });
            
              test('variant product when creating variant product', async ({ requestUpdateProduct, saveProducts }) => {
                request = productDataFactory.request.variant({
                  parentProductId: getProductId(variantProductDocument),
                });
            
                await saveProducts(originalProductDocument, variantProductDocument);
                const res = await requestUpdateProduct(getProductId(originalProductDocument), request);
                expect(res).toBeBadRequestResponse();
                expect(res).toHaveMessage('Product type of parent must be "specific" when creating "variant" product');
              });
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
