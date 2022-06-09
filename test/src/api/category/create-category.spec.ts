import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('POST category/v1/categories', () => {
  const request: Category.Request = {
    name: 'name',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  describe('called as an admin', () => {

    it('should create category', () => {
      cy.authenticate('admin1')
        .requestCreateCategory(request)
        .expectCreatedResponse()
        .validateCategoryDocument(request);
    });

    describe('with parent category', () => {
      let parentCategory: Category.Document;
      beforeEach(() => {
        cy.categoryTask('saveCategory', [
          categoryDocumentConverter.create({
            body: {
              name: 'parent',
              categoryType: 'regular',
              parentCategoryId: undefined,
            },
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN')),
        ]).then((parent: Category.Document) => {
          parentCategory = parent;
        });
      });

      it('should create category', () => {
        cy.authenticate('admin1')
          .requestCreateCategory({
            ...request,
            parentCategoryId: parentCategory._id.toString() as Category.IdType,
          })
          .expectCreatedResponse()
          .validateCategoryDocument(request, parentCategory);
      });
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if categoryType', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              categoryType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('categoryType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              categoryType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
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
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              parentCategoryId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('parentCategoryId', 'string', 'body');
        });

        it('does not match pattern', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              parentCategoryId: 'not-mongo-id' as Category.IdType,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('parentCategoryId', 'body');
        });

        it.only('does not belong to any category', () => {
          cy.authenticate('admin1')
            .requestCreateCategory({
              ...request,
              parentCategoryId: new Types.ObjectId().toString() as Category.IdType,
            })
            .expectBadRequestResponse()
            .expectMessage('Parent category not found');
        });
      });
    });
  });
});
