import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'old name',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  const categoryToUpdate: Category.Request = {
    name: 'new name',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, categoryToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('with test data created', () => {
      let categoryDocument: Category.Document;

      beforeEach(() => {
        cy.categoryTask('saveCategory', [
          categoryDocumentConverter.create({
            body: category,
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN')),
        ]).then((document: Category.Document) => {
          categoryDocument = document;
        });
      });
      it('should update a category', () => {
        cy
          .authenticate('admin1')
          .requestUpdateCategory(categoryDocument._id.toString() as Category.IdType, categoryToUpdate)
          .expectCreatedResponse()
          .validateCategoryDocument(categoryToUpdate);
      });
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if categoryType', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              categoryType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('categoryType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              categoryType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('categoryType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              categoryType: 'not-category-type' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('categoryType', 'body');
        });
      });

      describe('if parentCategoryId', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              parentCategoryId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('parentCategoryId', 'string', 'body');
        });

        it('does not match pattern', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              parentCategoryId: 'not-mongo-id' as Category.IdType,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('parentCategoryId', 'body');
        });

        it('does not belong to any category', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, {
              ...category,
              parentCategoryId: new Types.ObjectId().toString() as Category.IdType,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('parentCategoryId', 'body');
        });
      });

      describe('if categoryId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(`${new Types.ObjectId().toString()}-not-valid` as Category.IdType, categoryToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });

        it('does not belong to any category', () => {
          cy.authenticate('admin1')
            .requestUpdateCategory(new Types.ObjectId().toString() as Category.IdType, categoryToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
