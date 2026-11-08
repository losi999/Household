import { responseList as schema } from '@household/shared/schemas/category';
import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { categoryApiTest, categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { mergeTests } from '@playwright/test';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(categoryApiTest, categoryDbTest);

test.describe('GET /category/v1/categories', () => {
  let parentCategoryDocument: Documents.Category;
  let childCategoryDocument: Documents.Category;

  test.beforeEach(async () => {
    parentCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    childCategoryDocument = categoryDataFactory.document({
      parentCategory: parentCategoryDocument,
    });
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestListCategories }) => {
      const res = await requestListCategories();
      categoryApiExpect(res).toBeUnauthorizedResponse();
    });
  });

  for (const [
    userType,
    isAllowed,
  ] of entries(permissionMap)) {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType,
      });

      if (!isAllowed) {
        test('should return forbidden', async ({ requestListCategories }) => {
          const res = await requestListCategories();
          categoryApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of categories', async ({ requestListCategories, saveCategories }) => {
          await saveCategories(parentCategoryDocument, childCategoryDocument);

          const res = await requestListCategories();
          categoryApiExpect(res).toBeOkResponse();
          categoryApiExpect(res).toMatchSchema(schema);
          categoryApiExpect(res).toContainMatchingCategoryDocument(parentCategoryDocument);
          categoryApiExpect(res).toContainMatchingCategoryDocument(childCategoryDocument, parentCategoryDocument);
        });
      }
    });
  }
});
