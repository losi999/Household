import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category, Product } from '@household/shared/types/types';

describe('POST product/v1/products', () => {
  const request: Product.Request = {
    brand: 'tesco',
    measurement: 300,
    unitOfMeasurement: 'g',
  };

  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: 'category',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
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
          .validateProductDocument(request);
      });
    });

    describe('should return error', () => {
      describe('if brand', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              brand: undefined,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('brand', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              brand: 1 as any,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('brand', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              brand: '',
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectTooShortProperty('brand', 1, 'body');
        });
      });

      describe('if measurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              measurement: undefined,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('measurement', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              measurement: '1' as any,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('measurement', 'number', 'body');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              measurement: 0,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectTooSmallNumberProperty('measurement', 0, true, 'body');
        });
      });

      describe('if unitOfMeasurement', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              unitOfMeasurement: undefined,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectRequiredProperty('unitOfMeasurement', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              unitOfMeasurement: 1 as any,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateProduct({
              ...request,
              unitOfMeasurement: 'not-valid' as any,
            }, getCategoryId(categoryDocument))
            .expectBadRequestResponse()
            .expectWrongEnumValue('unitOfMeasurement', 'body');
        });
      });

      describe('is categoryId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestCreateProduct(request, createCategoryId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestCreateProduct(request, createCategoryId())
            .expectBadRequestResponse()
            .expectMessage('No category found');
        });
      });
    });
  });
});
