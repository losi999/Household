import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST category/v1/categories', () => {
  let request: Category.Request;
  let parentCategoryDocument: Category.Document;

  beforeEach(() => {
    request = {
      name: `name-${uuid()}`,
      categoryType: 'regular',
      parentCategoryId: undefined,
    };

    parentCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: `parent-${uuid()}`,
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
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
      cy.saveCategoryDocument(parentCategoryDocument)
        .authenticate(1)
        .requestCreateCategory({
          ...request,
          parentCategoryId: getCategoryId(parentCategoryDocument),
        })
        .expectCreatedResponse()
        .validateCategoryDocument(request, parentCategoryDocument);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different category', () => {
          const categoryDocument = categoryDocumentConverter.create({
            body: request,
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN'), true);

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
            .requestCreateCategory({
              ...request,
              categoryType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('categoryType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              categoryType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              categoryType: 'not-category-type' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('categoryType', 'body');
        });
      });

      describe('if parentCategoryId', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              parentCategoryId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('parentCategoryId', 'string', 'body');
        });

        it('does not match pattern', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              parentCategoryId: 'not-mongo-id' as Category.IdType,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('parentCategoryId', 'body');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestCreateCategory({
              ...request,
              parentCategoryId: createCategoryId(),
            })
            .expectBadRequestResponse()
            .expectMessage('Parent category not found');
        });
      });
    });
  });
});
