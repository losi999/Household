import { default as schema } from '@household/test/api/schemas/category-response-list';
import { Category } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType, UserType } from '@household/shared/enums';

const allowedUserTypes = [
  UserType.Editor,
  UserType.Viewer,
];

describe('GET /category/v1/categories', () => {
  let categoryDocument1: Category.Document;
  let categoryDocument2: Category.Document;

  beforeEach(() => {
    categoryDocument1 = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    categoryDocument2 = categoryDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetCategoryList()
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetCategoryList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of categories', () => {
          cy.saveCategoryDocument(categoryDocument1)
            .saveCategoryDocument(categoryDocument2)
            .authenticate(userType)
            .requestGetCategoryList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateCategoryListResponse([
              categoryDocument1,
              categoryDocument2,
            ]);
        });
      }
    });
  });
});
