import { default as schema } from '@household/test/api/schemas/category-response';
import { Category } from '@household/shared/types/types';
import { entries, getCategoryId } from '@household/shared/common/utils';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/api/utils';

const permissionMap = forbidUsers();

describe('GET /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let childCategoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
    childCategoryDocument = categoryDataFactory.document({
      parentCategory: categoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetCategory(categoryDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetCategory(categoryDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should get category by id', () => {
          cy.saveCategoryDocument(categoryDocument)
            .authenticate(userType)
            .requestGetCategory(getCategoryId(categoryDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateCategoryResponse(categoryDocument);
        });

        it('with child category should get category by id', () => {
          cy.saveCategoryDocument(categoryDocument)
            .saveCategoryDocument(childCategoryDocument)
            .authenticate(userType)
            .requestGetCategory(getCategoryId(childCategoryDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateCategoryResponse(childCategoryDocument, categoryDocument);
        });

        describe('should return error if categoryId', () => {
          it('is not mongo id', () => {
            cy.authenticate(userType)
              .requestGetCategory(categoryDataFactory.id('not-valid'))
              .expectBadRequestResponse()
              .expectWrongPropertyPattern('categoryId', 'pathParameters');
          });

          it('does not belong to any category', () => {
            cy.authenticate(userType)
              .requestGetCategory(categoryDataFactory.id())
              .expectNotFoundResponse();
          });
        });
      }
    });
  });
});
