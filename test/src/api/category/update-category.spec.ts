import { createCategoryId } from '@household/shared/common/test-data-factory';
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
        .requestUpdateCategory(createCategoryId(), categoryToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate('admin1')
        .requestUpdateCategory(createCategoryId(categoryDocument._id), categoryToUpdate)
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
            parentCategoryId: createCategoryId(categoryDocument._id),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'));
        childCategory._id = new Types.ObjectId();

        grandChildCategory = categoryDocumentConverter.create({
          body: {
            name: 'child of child',
            categoryType: 'regular',
            parentCategoryId: createCategoryId(childCategory._id),
          },
          parentCategory: childCategory,
        }, Cypress.env('EXPIRES_IN'));
        grandChildCategory._id = new Types.ObjectId();

        otherParentCategory = categoryDocumentConverter.create({
          body: {
            name: 'parent',
            categoryType: 'regular',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'));
        otherParentCategory._id = new Types.ObjectId();
      });

      it('to a different parent category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate('admin1')
          .requestUpdateCategory(createCategoryId(childCategory._id), {
            ...categoryToUpdate,
            parentCategoryId: createCategoryId(otherParentCategory._id),
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(createCategoryId(childCategory._id), createCategoryId(otherParentCategory._id))
          .validateCategoryParentReassign(createCategoryId(grandChildCategory._id), createCategoryId(childCategory._id));
      });

      it('to root from previously set parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate('admin1')
          .requestUpdateCategory(createCategoryId(childCategory._id), {
            ...categoryToUpdate,
            parentCategoryId: undefined,
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(createCategoryId(childCategory._id))
          .validateCategoryParentReassign(createCategoryId(grandChildCategory._id), createCategoryId(childCategory._id));
      });

      it('to a parent from previously unset value', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate('admin1')
          .requestUpdateCategory(createCategoryId(categoryDocument._id), {
            ...categoryToUpdate,
            parentCategoryId: createCategoryId(otherParentCategory._id),
          })
          .expectCreatedResponse()
          .validateCategoryParentReassign(createCategoryId(categoryDocument._id), createCategoryId(otherParentCategory._id))
          .validateCategoryParentReassign(createCategoryId(childCategory._id), createCategoryId(categoryDocument._id))
          .validateCategoryParentReassign(createCategoryId(grandChildCategory._id), createCategoryId(childCategory._id));
      });
    });
  });
  describe('should return error', () => {
    describe('if name', () => {
      it('is missing from body', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            name: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('name', 'body');
      });

      it('is not string', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            name: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('name', 'string', 'body');
      });

      it('is too short', () => {
        cy.authenticate('admin1')
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
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            categoryType: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('categoryType', 'body');
      });

      it('is not string', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            categoryType: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('categoryType', 'string', 'body');
      });

      it('is not a valid enum value', () => {
        cy.authenticate('admin1')
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
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            parentCategoryId: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('parentCategoryId', 'string', 'body');
      });

      it('does not match pattern', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), {
            ...category,
            parentCategoryId: 'not-mongo-id' as Category.IdType,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('parentCategoryId', 'body');
      });

      it('does not belong to any category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .authenticate('admin1')
          .requestUpdateCategory(createCategoryId(categoryDocument._id), {
            ...category,
            parentCategoryId: createCategoryId(),
          })
          .expectBadRequestResponse();
      });
    });

    describe('if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId('not-valid'), categoryToUpdate)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate('admin1')
          .requestUpdateCategory(createCategoryId(), categoryToUpdate)
          .expectNotFoundResponse();
      });
    });
  });

});
