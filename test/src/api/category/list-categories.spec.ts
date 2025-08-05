import { default as schema } from '@household/test/api/schemas/category-response-list';
import { Category } from '@household/shared/types/types';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = forbidUsers();

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

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
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
