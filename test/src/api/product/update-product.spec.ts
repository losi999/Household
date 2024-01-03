import { createProductId } from '@household/shared/common/test-data-factory';
import { getProductId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { Category, Product } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('PUT /product/v1/products/{productId}', () => {
  let request: Product.Request;
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  beforeEach(() => {
    request = {
      brand: `new tesco-${uuid()}`,
      measurement: 1000,
      unitOfMeasurement: 'g',
      barcode: '01234567890',
    };
    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: `inv cat-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
    productDocument = productDocumentConverter.create({
      body: {
        brand: `tesco-${uuid()}`,
        measurement: 1,
        unitOfMeasurement: 'kg',
        barcode: '9876543210',
      },
      category: categoryDocument,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProduct(createProductId(), request)
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

      describe('without optional property', () => {
        it('barcode', () => {
          const modifiedRequest: Product.Request = {
            ...request,
            barcode: undefined,
          };
          cy
            .saveProductDocument(productDocument)
            .authenticate(1)
            .requestUpdateProduct(getProductId(productDocument), modifiedRequest)
            .expectCreatedResponse()
            .validateProductDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if brand', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              brand: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('brand', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              brand: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              brand: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });

        it('is already in used by a different product', () => {
          const duplicateProductDocument = productDocumentConverter.create({
            body: request,
            category: categoryDocument,
          }, Cypress.env('EXPIRES_IN'), true);

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
            .requestUpdateProduct(createProductId(), {
              ...request,
              measurement: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('measurement', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              measurement: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              measurement: 0,
            })
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if unitOfMeasurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              unitOfMeasurement: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('unitOfMeasurement', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              unitOfMeasurement: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              unitOfMeasurement: 'not-valid' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('if barcode', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              barcode: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('barcode', 'string', 'body');
        });

        it('does not match pattern', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...request,
              barcode: 'not-barcode' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('barcode', 'body');
        });
      });

      describe('if productId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });

        it('does not belong to any product', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
