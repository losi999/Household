import { default as schema } from '@household/test/api/schemas/category-response';
import { Category } from '@household/shared/types/types';
import { getCategoryId } from '@household/shared/common/utils';
import { categoryDataFactory } from '@household/test/api/category/data-factory';

describe('GET /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let childCategoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });
    childCategoryDocument = categoryDataFactory.document({
      parentCategory: categoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetCategory(categoryDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get category by id', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate(1)
        .requestGetCategory(getCategoryId(categoryDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryResponse(categoryDocument);
    });

    it('with child category should get category by id', () => {
      cy.saveCategoryDocument(categoryDocument)
        .saveCategoryDocument(childCategoryDocument)
        .authenticate(1)
        .requestGetCategory(getCategoryId(childCategoryDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryResponse(childCategoryDocument, categoryDocument);
    });

    describe('should return error if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestGetCategory(categoryDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate(1)
          .requestGetCategory(categoryDataFactory.id())
          .expectNotFoundResponse();
      });
    });
  });
});
