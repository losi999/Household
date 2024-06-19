import { getCategoryId } from '@household/shared/common/utils';
import { Category } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';

describe('POST category/v1/categories', () => {
  let request: Category.Request;
  let parentCategoryDocument: Category.Document;

  beforeEach(() => {
    request = categoryDataFactory.request();

    parentCategoryDocument = categoryDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateCategory(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should create category', () => {
      cy.authenticate(1)
        .requestCreateCategory(request)
        .expectCreatedResponse()
        .validateCategoryDocument(request);
    });

    it('should create category with parent category', () => {
      request = categoryDataFactory.request({
        parentCategoryId: getCategoryId(parentCategoryDocument),
      });

      cy.saveCategoryDocument(parentCategoryDocument)
        .authenticate(1)
        .requestCreateCategory(request)
        .expectCreatedResponse()
        .validateCategoryDocument(request, parentCategoryDocument);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateCategory(categoryDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory(categoryDataFactory.request({
              name: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
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
            .authenticate(1)
            .requestCreateCategory(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate category name');
        });
      });

      describe('if categoryType', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateCategory(categoryDataFactory.request({
              categoryType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('categoryType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory(categoryDataFactory.request({
              categoryType: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateCategory(
              categoryDataFactory.request({
                categoryType: 'not-category-type',
              }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('categoryType', 'body');
        });
      });

      describe('if parentCategoryId', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory(
              categoryDataFactory.request({
                parentCategoryId: 1,
              }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('parentCategoryId', 'string', 'body');
        });

        it('does not match pattern', () => {
          cy.authenticate(1)
            .requestCreateCategory(
              categoryDataFactory.request({
                parentCategoryId: 'not-mongo-id',
              }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('parentCategoryId', 'body');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestCreateCategory(
              categoryDataFactory.request({
                parentCategoryId: categoryDataFactory.id(),
              }))
            .expectBadRequestResponse()
            .expectMessage('Parent category not found');
        });
      });
    });
  });
});
