import { entries, getCategoryId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';
import { Category, Product } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { allowUsers } from '@household/test/api/utils';

const permissionMap = allowUsers('editor') ;

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
      cy.authenticate('anonymous')
        .requestCreateProduct(request, getCategoryId(categoryDocument))
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateProduct(request, getCategoryId(categoryDocument))
            .expectForbiddenResponse();
        });
      } else {
        describe('should create product', () => {
          it('with complete body', () => {
            cy.saveCategoryDocument(categoryDocument)
              .authenticate(userType)
              .requestCreateProduct(request, getCategoryId(categoryDocument))
              .expectCreatedResponse()
              .validateProductDocument(request, getCategoryId(categoryDocument));
          });
        });

        describe('should return error', () => {
          describe('if brand', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  brand: undefined,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectRequiredProperty('brand', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  brand: <any>1,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectWrongPropertyType('brand', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
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
                .authenticate(userType)
                .requestCreateProduct(request, getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectMessage('Duplicate product name');
            });
          });

          describe('if measurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  measurement: undefined,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectRequiredProperty('measurement', 'body');
            });

            it('is not number', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  measurement: <any>'1',
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectWrongPropertyType('measurement', 'number', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  measurement: 0,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('measurement', 0, true, 'body');
            });
          });

          describe('if unitOfMeasurement', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  unitOfMeasurement: undefined,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectRequiredProperty('unitOfMeasurement', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  unitOfMeasurement: <any>1,
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectWrongPropertyType('unitOfMeasurement', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestCreateProduct(productDataFactory.request({
                  unitOfMeasurement: <any>'not-valid',
                }), getCategoryId(categoryDocument))
                .expectBadRequestResponse()
                .expectWrongEnumValue('unitOfMeasurement', 'body');
            });
          });

          describe('if categoryId', () => {
            it('is not a valid mongo id', () => {
              cy.authenticate(userType)
                .requestCreateProduct(request, categoryDataFactory.id('not-valid'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('categoryId', 'pathParameters');
            });

            it('does not belong to any category', () => {
              cy.authenticate(userType)
                .requestCreateProduct(request, categoryDataFactory.id())
                .expectBadRequestResponse()
                .expectMessage('No category found');
            });
          });
        });
      }
    });
  });
});
