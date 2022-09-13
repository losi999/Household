import { createCategoryId } from '@household/shared/common/test-data-factory';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'category',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: category,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    categoryDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteCategory(createCategoryId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate('admin1')
        .requestDeleteCategory(createCategoryId(categoryDocument._id))
        .expectNoContentResponse()
        .validateCategoryDeleted(createCategoryId(categoryDocument._id));
    });

    describe('in related transactions category', () => {

      beforeEach(() => {
      });
      it.skip('should be unset if category is deleted', () => {
      });
    });

    describe('should return error', () => {
      describe('if categoryId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteCategory(createCategoryId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });
      });
    });
  });
});
