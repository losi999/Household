import { getCategoryId } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';
import { Category } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';

const allowedUserTypes = [UserType.Editor];

describe('POST category/v1/categories', () => {
  let request: Category.Request;
  let parentCategoryDocument: Category.Document;
  let grandparentCategoryDocument: Category.Document;

  beforeEach(() => {
    request = categoryDataFactory.request();

    grandparentCategoryDocument = categoryDataFactory.document();
    parentCategoryDocument = categoryDataFactory.document({
      parentCategory: grandparentCategoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateCategory(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateCategory(request)
            .expectForbiddenResponse();
        });
      } else {
        it('should create category', () => {
          cy.authenticate(userType)
            .requestCreateCategory(request)
            .expectCreatedResponse()
            .validateCategoryDocument(request);
        });

        it('should create category with parent category', () => {
          request = categoryDataFactory.request({
            parentCategoryId: getCategoryId(parentCategoryDocument),
          });

          cy.saveCategoryDocuments([
            grandparentCategoryDocument,
            parentCategoryDocument,
          ])
            .authenticate(userType)
            .requestCreateCategory(request)
            .expectCreatedResponse()
            .validateCategoryDocument(request, grandparentCategoryDocument, parentCategoryDocument);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCategory(categoryDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCategory(categoryDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateCategory(categoryDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in used by a different category', () => {
              const categoryDocument = categoryDataFactory.document({
                body: request,
              });

              cy.saveCategoryDocument(categoryDocument)
                .authenticate(userType)
                .requestCreateCategory(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate category name');
            });
          });

          describe('if categoryType', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateCategory(categoryDataFactory.request({
                  categoryType: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('categoryType', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCategory(categoryDataFactory.request({
                  categoryType: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('categoryType', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestCreateCategory(
                  categoryDataFactory.request({
                    categoryType: <any>'not-category-type',
                  }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('categoryType', 'body');
            });
          });

          describe('if parentCategoryId', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateCategory(
                  categoryDataFactory.request({
                    parentCategoryId: <any>1,
                  }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('parentCategoryId', 'string', 'body');
            });

            it('does not match pattern', () => {
              cy.authenticate(userType)
                .requestCreateCategory(
                  categoryDataFactory.request({
                    parentCategoryId: <any>'not-mongo-id',
                  }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('parentCategoryId', 'body');
            });

            it('does not belong to any category', () => {
              cy.authenticate(userType)
                .requestCreateCategory(
                  categoryDataFactory.request({
                    parentCategoryId: categoryDataFactory.id(),
                  }))
                .expectBadRequestResponse()
                .expectMessage('Parent category not found');
            });
          });
        });
      }
    });
  });
});
