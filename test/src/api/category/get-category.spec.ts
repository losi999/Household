import { default as schema } from '@household/test/schemas/category-response';
import { getCategoryId } from '@household/shared/common/utils';
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

test.describe('GET /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let childCategoryDocument: Category.Document;

  test.beforeEach(() => {
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
        test('should return forbidden', async ({ requestGetCategory }) => {
          const res = await requestGetCategory(categoryDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get category by id', async ({ requestGetCategory }) => {
          await categoryService.saveCategory(categoryDocument);

          const res = await requestGetCategory(getCategoryId(categoryDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchCategoryDocument(categoryDocument);
        });

        test('with child category should get category by id', async ({ requestGetCategory }) => {
          await categoryService.saveCategories(categoryDocument, childCategoryDocument);

          const res = await requestGetCategory(getCategoryId(childCategoryDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchCategoryDocument(childCategoryDocument, categoryDocument);
        });

        test.describe('should return error if categoryId', () => {
          test('is not mongo id', async ({ requestGetCategory }) => {
            const res = await requestGetCategory('not-valid' as Category.Id);
            expect(res).toBeBadRequestResponse();
            expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
          });

          test('does not belong to any category', async ({ requestGetCategory }) => {
            const res = await requestGetCategory(categoryDataFactory.id());
            expect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  }
});
