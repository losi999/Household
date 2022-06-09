import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'category',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteCategory(new Types.ObjectId().toString() as Category.IdType)
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

      it('should delete category', () => {
        cy .authenticate('admin1')
          .requestDeleteCategory(categoryDocument._id.toString() as Category.IdType)
          .expectNoContentResponse()
          .validateCategoryDeleted(categoryDocument._id.toString() as Category.IdType);
      });

      describe('in related transactions category', () => {

        beforeEach(() => {
        });
        it.skip('should be unset if category is deleted', () => {
        });
      });

    });

    describe('should return error', () => {
      describe('if categoryId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteCategory(`${new Types.ObjectId()}-not-valid` as Category.IdType)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });
      });
    });
  });
});
