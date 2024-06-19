import { getProductId } from '@household/shared/common/utils';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';

describe('PUT /product/v1/products/{productId}', () => {
  let request: Product.Request;
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  beforeEach(() => {
    request = productDataFactory.request();

    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });

    productDocument = productDataFactory.document({
      category: categoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProduct(productDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update product', () => {
      it('with complete body', () => {
        cy
          .saveProductDocument(productDocument)
          .authenticate(1)
          .requestUpdateProduct(getProductId(productDocument), request)
          .expectCreatedResponse()
          .validateProductDocument(request);
      });
    });

    describe('should return error', () => {
      describe('if brand', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              brand: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('brand', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              brand: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
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
            .authenticate(1)
            .requestUpdateProduct(getProductId(productDocument), request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate product name');
        });
      });

      describe('if measurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              measurement: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('measurement', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              measurement: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              measurement: 0,
            }))
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if unitOfMeasurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              unitOfMeasurement: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('unitOfMeasurement', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              unitOfMeasurement: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), productDataFactory.request({
              unitOfMeasurement: 'not-valid',
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('if productId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });

        it('does not belong to any product', () => {
          cy.authenticate(1)
            .requestUpdateProduct(productDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
