import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { default as schema } from '@household/test/api/schemas/category-response';
import { Category } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { createCategoryId } from '@household/shared/common/test-data-factory';

describe('GET /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'category',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  const childCategory: Category.Request = {
    name: 'child',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  let categoryDocument: Category.Document;
  let childCategoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: category,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    categoryDocument._id = new Types.ObjectId();

    childCategoryDocument = categoryDocumentConverter.create({
      body: {
        ...childCategory,
        parentCategoryId: createCategoryId(categoryDocument._id),
      },
      parentCategory: categoryDocument,
    }, Cypress.env('EXPIRES_IN'));
    childCategoryDocument._id = new Types.ObjectId();
  });

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetCategory(createCategoryId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get category by id', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate('admin1')
        .requestGetCategory(createCategoryId(categoryDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryResponse(categoryDocument);
    });

    it('with child category should get category by id', () => {
      cy.saveCategoryDocument(categoryDocument)
        .saveCategoryDocument(childCategoryDocument)
        .authenticate('admin1')
        .requestGetCategory(createCategoryId(childCategoryDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateCategoryResponse(childCategoryDocument, categoryDocument);
    });

    describe('should return error if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetCategory(createCategoryId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate('admin1')
          .requestGetCategory(createCategoryId())
          .expectNotFoundResponse();
      });
    });
  });
});
