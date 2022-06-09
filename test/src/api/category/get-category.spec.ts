import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as schema } from '@household/test/api/schemas/category-response';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('GET /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'category',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetCategory(new Types.ObjectId().toString() as Category.IdType)
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

      it('should get category by id', () => {
        cy.authenticate('admin1')
          .requestGetCategory(categoryDocument._id.toString() as Category.IdType)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateCategoryResponse(categoryDocument);
      });

      describe('with child category', () => {
        let childCategoryDocument: Category.Document;
        const childCategory: Category.Request = {
          name: 'child',
          categoryType: 'regular',
          parentCategoryId: undefined,
        };

        beforeEach(() => {
          cy.categoryTask('saveCategory', [
            categoryDocumentConverter.create({
              body: {
                ...childCategory,
                parentCategoryId: categoryDocument._id.toString() as Category.IdType,
              },
              parentCategory: categoryDocument,
            }, Cypress.env('EXPIRES_IN')),
          ]).then((document: Category.Document) => {
            childCategoryDocument = document;
          });
        });

        it('should get category by id', () => {
          cy.authenticate('admin1')
            .requestGetCategory(childCategoryDocument._id.toString() as Category.IdType)
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateCategoryResponse(childCategoryDocument, categoryDocument);
        });
      });
    });

    describe('should return error if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetCategory(`${new Types.ObjectId().toString()}-not-valid` as Category.IdType)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate('admin1')
          .requestGetCategory(new Types.ObjectId().toString() as Category.IdType)
          .expectNotFoundResponse();
      });
    });
  });
});
