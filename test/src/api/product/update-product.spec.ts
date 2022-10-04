import { createProductId } from '@household/shared/common/test-data-factory';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { Category, Product } from '@household/shared/types/types';

describe('PUT /product/v1/products/{productId}', () => {
  const product: Product.Request = {
    brand: 'tesco',
    measurement: 1,
    unitOfMeasurement: 'kg',
  };

  const productToUpdate: Product.Request = {
    brand: 'new tesco',
    measurement: 1000,
    unitOfMeasurement: 'g',
  };

  let productDocument: Product.Document;
  let categoryDocument: Category.Document;
  let categoryId: Category.IdType;

  beforeEach(() => {
    productDocument = productDocumentConverter.create(product, Cypress.env('EXPIRES_IN'), true);
    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: 'inv cat',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
    categoryId = getCategoryId(categoryDocument);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProduct(createProductId(), productToUpdate)
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
          .requestUpdateProduct(getProductId(productDocument), productToUpdate)
          .expectCreatedResponse()
          .validateProductDocument(productToUpdate);
      });
    });

    describe('should return error', () => {
      describe('if brand', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              brand: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('brand', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              brand: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              brand: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });
      });

      describe('if measurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              measurement: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('measurement', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              measurement: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
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
              ...product,
              unitOfMeasurement: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('unitOfMeasurement', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              unitOfMeasurement: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), {
              ...product,
              unitOfMeasurement: 'not-valid' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('if productId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId('not-valid'), productToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });

        it('does not belong to any product', () => {
          cy.authenticate(1)
            .requestUpdateProduct(createProductId(), productToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
