import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { CategoryType, UserType } from '@household/shared/enums';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';

const allowedUserTypes = [UserType.Editor];

describe('PUT /product/v1/products/{productId}', () => {
  let request: Product.Request;
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  beforeEach(() => {
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateProduct(productDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateProduct(productDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update product', () => {
          it('with complete body', () => {
            cy
              .saveProductDocument(productDocument)
              .authenticate(userType)
              .requestUpdateProduct(getProductId(productDocument), request)
              .expectCreatedResponse()
              .validateProductDocument(request, getCategoryId(categoryDocument));
          });
        });

        describe('should return error', () => {
          describe('if brand', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  brand: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('brand', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  brand: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('brand', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  brand: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('brand', 1, 'body');
            });

            it('is already in used by a different product', () => {
              const duplicateProductDocument = productDataFactory.document({
                body: request,
                category: categoryDocument,
              });

              cy.saveProductDocument(productDocument)
                .saveProductDocument(duplicateProductDocument)
                .authenticate(userType)
                .requestUpdateProduct(getProductId(productDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate product name');
            });
          });

          describe('if measurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  measurement: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('measurement', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  measurement: <any>'1',
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('measurement', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  measurement: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('measurement', 0, true, 'body');
            });
          });

          describe('if unitOfMeasurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  unitOfMeasurement: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('unitOfMeasurement', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  unitOfMeasurement: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
                  unitOfMeasurement: <any>'not-valid',
                }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('unitOfMeasurement', 'body');
            });
          });

          describe('if productId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('productId', 'pathParameters');
            });

            it('does not belong to any product', () => {
              cy.authenticate(userType)
                .requestUpdateProduct(productDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
