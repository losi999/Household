import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { Category } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('PUT /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let request: Category.Request;

  beforeEach(() => {
    request = {
      name: `new name-${uuid()}`,
      categoryType: 'regular',
      parentCategoryId: undefined,
    };

    categoryDocument = categoryDocumentConverter.create({
      body: {
        name: `old name-${uuid()}`,
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateCategory(createCategoryId(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update a category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate(1)
        .requestUpdateCategory(getCategoryId(categoryDocument), request)
        .expectCreatedResponse()
        .validateCategoryDocument(request);
    });

    it('should keep existing product', () => {
      const productDocument = productDocumentConverter.create({
        body: {
          brand: `tesco-${uuid()}`,
          measurement: 500,
          unitOfMeasurement: 'g',
        },
        category: categoryDocument,
      }, Cypress.env('EXPIRES_IN'), true);

      cy.saveCategoryDocument(categoryDocument)
        .saveProductDocument(productDocument)
        .authenticate(1)
        .requestUpdateCategory(getCategoryId(categoryDocument), request)
        .expectCreatedResponse()
        .validateCategoryDocument(request, undefined, productDocument);
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;
      let otherParentCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDocumentConverter.create({
          body: {
            name: `child-${uuid()}`,
            categoryType: 'regular',
            parentCategoryId: getCategoryId(categoryDocument),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        grandChildCategory = categoryDocumentConverter.create({
          body: {
            name: `child of child-${uuid()}`,
            categoryType: 'regular',
            parentCategoryId: getCategoryId(childCategory),
          },
          parentCategory: childCategory,
        }, Cypress.env('EXPIRES_IN'), true);

        otherParentCategory = categoryDocumentConverter.create({
          body: {
            name: `parent-${uuid()}`,
            categoryType: 'regular',
            parentCategoryId: undefined,
          },
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);
      });

      it('to a different parent category', () => {
        request.parentCategoryId = getCategoryId(otherParentCategory);

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(childCategory), request)
          .expectCreatedResponse()
          .validateCategoryDocument(request, otherParentCategory)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to root from previously set parent', () => {
        request.parentCategoryId = undefined;

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(childCategory), request)
          .expectCreatedResponse()
          .validateCategoryDocument(request)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to a parent from previously unset value', () => {
        request.parentCategoryId = getCategoryId(otherParentCategory);

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .saveCategoryDocument(otherParentCategory)
          .authenticate(1)
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
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            name: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('name', 'body');
      });

      it('is not string', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            name: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('name', 'string', 'body');
      });

      it('is too short', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            name: '',
          })
          .expectBadRequestResponse()
          .expectTooShortProperty('name', 1, 'body');
      });

      it('is already in used by a different category', () => {
        const duplicateCategoryDocument = categoryDocumentConverter.create({
          body: request,
          parentCategory: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        cy.saveCategoryDocument(duplicateCategoryDocument)
          .saveCategoryDocument(categoryDocument)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(categoryDocument), request)
          .expectBadRequestResponse()
          .expectMessage('Duplicate category name');
      });
    });

    describe('if categoryType', () => {
      it('is missing from body', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            categoryType: undefined,
          })
          .expectBadRequestResponse()
          .expectRequiredProperty('categoryType', 'body');
      });

      it('is not string', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            categoryType: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('categoryType', 'string', 'body');
      });

      it('is not a valid enum value', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
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
            ...request,
            parentCategoryId: 1 as any,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyType('parentCategoryId', 'string', 'body');
      });

      it('does not match pattern', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), {
            ...request,
            parentCategoryId: 'not-mongo-id' as Category.Id,
          })
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('parentCategoryId', 'body');
      });

      it('does not belong to any category', () => {
        cy.saveCategoryDocument(categoryDocument)
          .authenticate(1)
          .requestUpdateCategory(getCategoryId(categoryDocument), {
            ...request,
            parentCategoryId: createCategoryId(),
          })
          .expectBadRequestResponse();
      });
    });

    describe('if categoryId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId('not-valid'), request)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('categoryId', 'pathParameters');
      });

      it('does not belong to any category', () => {
        cy.authenticate(1)
          .requestUpdateCategory(createCategoryId(), request)
          .expectNotFoundResponse();
      });
    });
  });

});
