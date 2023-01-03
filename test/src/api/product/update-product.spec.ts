import { createProductId } from '@household/shared/common/test-data-factory';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { Category, Product } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('PUT /product/v1/products/{productId}', () => {
  let request: Product.Request;
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;
  let categoryId: Category.IdType;

  beforeEach(() => {
    request = {
      brand: `new tesco-${uuid()}`,
      measurement: 1000,
      unitOfMeasurement: 'g',
    };

    productDocument = productDocumentConverter.create({
      brand: `tesco-${uuid()}`,
      measurement: 1,
      unitOfMeasurement: 'kg',
    }, Cypress.env('EXPIRES_IN'), true);
    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: `inv cat-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
    categoryId = getCategoryId(categoryDocument);
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
          .saveProductDocument({
            document: productDocument,
            categoryId,
          })
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
          const duplicateProductDocument = productDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

          cy.saveProductDocument({
            document: productDocument,
            categoryId,
          })
            .saveProductDocument({
              document: duplicateProductDocument,
              categoryId,
            })
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
