import { getCategoryId } from '@household/shared/common/utils';
import { Category } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';

describe('PUT /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let request: Category.Request;

  beforeEach(() => {
    request = categoryDataFactory.request();

    categoryDocument = categoryDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateCategory(categoryDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate('admin')
        .requestUpdateCategory(getCategoryId(categoryDocument), request)
        .expectCreatedResponse()
        .validateCategoryDocument(request);
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;
      let otherParentCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDataFactory.document({
          parentCategory: categoryDocument,
        });

        grandChildCategory = categoryDataFactory.document({
          parentCategory: childCategory,
        });

        otherParentCategory = categoryDataFactory.document();
      });

      it('to a different parent category', () => {
        request = categoryDataFactory.request({
          parentCategoryId: getCategoryId(otherParentCategory),
        });

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(childCategory), request)
          .expectCreatedResponse()
          .validateCategoryDocument(request, otherParentCategory)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to root from previously set parent', () => {
        request = categoryDataFactory.request({
          parentCategoryId: undefined,
        });

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(childCategory), request)
          .expectCreatedResponse()
          .validateCategoryDocument(request)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to a parent from previously unset value', () => {
        request = categoryDataFactory.request({
          parentCategoryId: getCategoryId(otherParentCategory),
        });

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(categoryDocument), request)
          .expectCreatedResponse()
          .validateCategoryDocument(request, otherParentCategory)
          .validateCategoryParentReassign(childCategory, getCategoryId(categoryDocument))
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });
    });
  });
  describe('should return error', () => {
    describe('if name', () => {
      it('is missing from body', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              name: undefined,
            }))
          .expectBadRequestResponse()
          .expectRequiredProperty('name', 'body');
      });

      it('is not string', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              name: <any>1,
            }))
          .expectBadRequestResponse()
          .expectWrongPropertyType('name', 'string', 'body');
      });

      it('is too short', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              name: '',
            }))
          .expectBadRequestResponse()
          .expectTooShortProperty('name', 1, 'body');
      });

      it('is already in used by a different category', () => {
        const duplicateCategoryDocument = categoryDataFactory.document({
          body: request,
        });

        cy.saveCategoryDocument(duplicateCategoryDocument)
          .saveCategoryDocument(categoryDocument)
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(categoryDocument), request)
          .expectBadRequestResponse()
          .expectMessage('Duplicate category name');
      });
    });

    describe('if categoryType', () => {
      it('is missing from body', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              categoryType: undefined,
            }))
          .expectBadRequestResponse()
          .expectRequiredProperty('categoryType', 'body');
      });

      it('is not string', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              categoryType: <any>1,
            }))
          .expectBadRequestResponse()
          .expectWrongPropertyType('categoryType', 'string', 'body');
      });

      it('is not a valid enum value', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              categoryType: <any>'not-category-type',
            }))
          .expectBadRequestResponse()
          .expectWrongEnumValue('categoryType', 'body');
      });
    });

    describe('if parentCategoryId', () => {
      it('is not string', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              parentCategoryId: <any>1,
            }))
          .expectBadRequestResponse()
          .expectWrongPropertyType('parentCategoryId', 'string', 'body');
      });

      it('does not match pattern', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(),
            categoryDataFactory.request({
              parentCategoryId: <any>'not-mongo-id',
            }))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('parentCategoryId', 'body');
      });

      it('does not belong to any category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(categoryDocument),
            categoryDataFactory.request({
              parentCategoryId: categoryDataFactory.id(),
            }))
          .expectBadRequestResponse()
          .expectMessage('Parent category not found');
      });

      it('is already a descendent category', () => {
        const childCategoryDocument = categoryDataFactory.document({
          parentCategory: categoryDocument,
        });

        cy.saveCategoryDocuments([
          categoryDocument,
          childCategoryDocument,
        ])
          .authenticate('admin')
          .requestUpdateCategory(getCategoryId(categoryDocument),
            categoryDataFactory.request({
              parentCategoryId: getCategoryId(childCategoryDocument),
            }))
          .expectBadRequestResponse()
          .expectMessage('Parent category is already a child of the current category');
      });
    });

    describe('if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id('not-valid'), request)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate('admin')
          .requestUpdateCategory(categoryDataFactory.id(), request)
          .expectNotFoundResponse();
      });
    });
  });

});
