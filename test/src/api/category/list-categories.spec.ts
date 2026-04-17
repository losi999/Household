import { default as schema } from '@household/test/schemas/category-response-list';
import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { CategoryType } from '@household/shared/enums';
import { Category } from '@household/shared/types/types';
import { mergeExpects } from '@playwright/test';
import { categoryService } from '@household/test/dependencies';

const permissionMap = forbidUsers();

const expect = mergeExpects(categoryApiExpect, apiExpect);

test.describe('GET /category/v1/categories', () => {
  let parentCategoryDocument: Category.Document;
  let childCategoryDocument: Category.Document;

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
      expect(res).toBeUnauthorizedResponse();
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
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of categories', async ({ requestListCategories }) => {
          await categoryService.saveCategories(parentCategoryDocument, childCategoryDocument);

          const res = await requestListCategories();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchCategoryDocumentInList(parentCategoryDocument);
          expect(res).toMatchCategoryDocumentInList(childCategoryDocument, parentCategoryDocument);
        });
      }
    });
  }
});
