import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { Category } from '@household/shared/types/types';

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

  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: category,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateCategory(createCategoryId(), categoryToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate(1)
        .requestUpdateCategory(getCategoryId(categoryDocument), categoryToUpdate)
        .expectCreatedResponse()
        .validateCategoryDocument(categoryToUpdate);
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;
      let otherParentCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDocumentConverter.create({
          body: {
            name: 'child',
            categoryType: 'regular',
            parentCategoryId: getCategoryId(categoryDocument),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        grandChildCategory = categoryDocumentConverter.create({
          body: {
            name: 'child of child',
            categoryType: 'regular',
            parentCategoryId: getCategoryId(childCategory),
          },
          parentCategory: childCategory,
        }, Cypress.env('EXPIRES_IN'), true);

        otherParentCategory = categoryDocumentConverter.create({
          body: {
            name: 'parent',
            categoryType: 'regular',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);
      });

      it('to a different parent category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(childCategory), {
            ...categoryToUpdate,
            parentCategoryId: getCategoryId(otherParentCategory),
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(getCategoryId(childCategory), getCategoryId(otherParentCategory))
          .validateCategoryParentReassign(getCategoryId(grandChildCategory), getCategoryId(childCategory));
      });

      it('to root from previously set parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(childCategory), {
            ...categoryToUpdate,
            parentCategoryId: undefined,
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(getCategoryId(childCategory))
          .validateCategoryParentReassign(getCategoryId(grandChildCategory), getCategoryId(childCategory));
      });

      it('to a parent from previously unset value', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(categoryDocument), {
            ...categoryToUpdate,
            parentCategoryId: getCategoryId(otherParentCategory),
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(getCategoryId(categoryDocument), getCategoryId(otherParentCategory))
          .validateCategoryParentReassign(getCategoryId(childCategory), getCategoryId(categoryDocument))
          .validateCategoryParentReassign(getCategoryId(grandChildCategory), getCategoryId(childCategory));
      });
    });
  });
  describe('should return error', () => {
    describe('if name', () => {
      it('is missing from body', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            name: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('name', 'body');
      });

      it('is not string', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            name: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('name', 'string', 'body');
      });

      it('is too short', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            name: '',
          })
          .expectBadRequestResponse()
          .expectTooShortProperty('name', 1, 'body');
      });
    });

    describe('if categoryType', () => {
      it('is missing from body', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            categoryType: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('categoryType', 'body');
      });

      it('is not string', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            categoryType: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('categoryType', 'string', 'body');
      });

      it('is not a valid enum value', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            categoryType: 'not-category-type' as any,
          })
          .expectBadRequestResponse()
          .expectWrongEnumValue('categoryType', 'body');
      });
    });

    describe('if parentCategoryId', () => {
      it('is not string', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            parentCategoryId: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('parentCategoryId', 'string', 'body');
      });

      it('does not match pattern', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            parentCategoryId: 'not-mongo-id' as Category.IdType,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('parentCategoryId', 'body');
      });

      it('does not belong to any category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(categoryDocument), {
            ...category,
            parentCategoryId: createCategoryId(),
          })
          .expectBadRequestResponse();
      });
    });

    describe('if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId('not-valid'), categoryToUpdate)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), categoryToUpdate)
          .expectNotFoundResponse();
      });
    });
  });

});
