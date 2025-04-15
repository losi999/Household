import { getCategoryId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';

describe('POST product/v1/products', () => {
  let request: Product.Request;
  let categoryDocument: Category.Document;

  beforeEach(() => {
    request = productDataFactory.request();

    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateProduct(request, getCategoryId(categoryDocument))
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should create product', () => {
      it('with complete body', () => {
        cy.saveCategoryDocument(categoryDocument)
          .authenticate(1)
          .requestCreateProduct(request, getCategoryId(categoryDocument))
          .expectCreatedResponse()
          .validateProductDocument(request, getCategoryId(categoryDocument));
      });
    });

    describe('should return error', () => {
      describe('if brand', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              brand: undefined,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('brand', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              brand: 1,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              brand: '',
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });

        it('is already in used by a different product', () => {
          const productDocument = productDataFactory.document({
            body: request,
            category: categoryDocument,
          });

          cy.saveProductDocument(productDocument)
            .saveCategoryDocument(categoryDocument)
            .authenticate(1)
            .requestCreateProduct(request, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectMessage('Duplicate product name');
        });
      });

      describe('if measurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              measurement: undefined,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('measurement', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              measurement: '1',
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              measurement: 0,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if unitOfMeasurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              unitOfMeasurement: undefined,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('unitOfMeasurement', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              unitOfMeasurement: 1,
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateProduct(productDataFactory.request({
              unitOfMeasurement: 'not-valid',
            }), getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('is categoryId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestCreateProduct(request, categoryDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestCreateProduct(request, categoryDataFactory.id())
            .expectBadRequestResponse()
            .expectMessage('No category found');
        });
      });
    });
  });
});
