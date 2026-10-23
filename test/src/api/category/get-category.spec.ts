import { response as schema } from '@household/shared/schemas/category';
import { getCategoryId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { categoryApiTest, categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { mergeTests } from '@playwright/test';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(categoryApiTest, categoryDbTest);

test.describe('GET /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Documents.Category;
  let childCategoryDocument: Documents.Category;

  test.beforeEach(async () => {
    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
    childCategoryDocument = categoryDataFactory.document({
      parentCategory: categoryDocument,
    });
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestGetCategory }) => {
      const res = await requestGetCategory(categoryDataFactory.id());
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
        test('should return forbidden', async ({ requestGetCategory }) => {
          const res = await requestGetCategory(categoryDataFactory.id());
          categoryApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get category by id', async ({ requestGetCategory, saveCategory }) => {
          await saveCategory(categoryDocument);

          const res = await requestGetCategory(getCategoryId(categoryDocument));
          categoryApiExpect(res).toBeOkResponse();
          categoryApiExpect(res).toMatchSchema(schema);
          categoryApiExpect(res).toMatchCategoryDocument(categoryDocument);
        });

        test('with child category should get category by id', async ({ requestGetCategory, saveCategories }) => {
          await saveCategories(categoryDocument, childCategoryDocument);

          const res = await requestGetCategory(getCategoryId(childCategoryDocument));
          categoryApiExpect(res).toBeOkResponse();
          categoryApiExpect(res).toMatchSchema(schema);
          categoryApiExpect(res).toMatchCategoryDocument(childCategoryDocument, categoryDocument);
        });

        test.describe('should return error if categoryId', () => {
          test('is not mongo id', async ({ requestGetCategory }) => {
            const res = await requestGetCategory('not-valid' as Api.Category.Id);
            categoryApiExpect(res).toBeBadRequestResponse();
            categoryApiExpect(res).toHavePatternValidationError('pathParameters', 'categoryId');
          });

          test('does not belong to any category', async ({ requestGetCategory }) => {
            const res = await requestGetCategory(categoryDataFactory.id());
            categoryApiExpect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  }
});
