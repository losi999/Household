import { entries, getCategoryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { categoryApiTest, categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { mergeTests } from '@playwright/test';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';

const permissionMap = allowUsers('editor');

const test = mergeTests(categoryApiTest, categoryDbTest);

test.describe('POST /category/v1/categories', () => {
  let req: Requests.Category;
  let parentCategoryDocument: Documents.Category;
  let grandparentCategoryDocument: Documents.Category;

  test.beforeEach(async () => {
    req = categoryDataFactory.request({
      parentCategoryId: undefined,
    });

    grandparentCategoryDocument = categoryDataFactory.document();
    parentCategoryDocument = categoryDataFactory.document({
      parentCategory: grandparentCategoryDocument,
    });
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateCategory }) => {
      const res = await requestCreateCategory(req);
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
        test('should return forbidden', async ({ requestCreateCategory }) => {
          const res = await requestCreateCategory(req);
          categoryApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create category', async ({ requestCreateCategory, findCategoryById }) => {
          test.step('logging 1', () => {
            
          });
          const res = await requestCreateCategory(req);
          categoryApiExpect(res).toBeCreatedResponse();

          const { categoryId } = (await res.json()) as Api.Category.CategoryId;
          categoryApiExpect(req).toHaveBeenSavedAsCategoryDocument(await findCategoryById(categoryId));
        });

        test('should create category with parent category', async ({ requestCreateCategory, saveCategories, findCategoryById }) => {
          req = categoryDataFactory.request({
            parentCategoryId: getCategoryId(parentCategoryDocument),
          });

          await saveCategories(grandparentCategoryDocument, parentCategoryDocument);

          const res = await requestCreateCategory(req);
          categoryApiExpect(res).toBeCreatedResponse();

          const { categoryId } = (await res.json()) as Api.Category.CategoryId;
          categoryApiExpect(req).toHaveBeenSavedAsCategoryDocument(await findCategoryById(categoryId), grandparentCategoryDocument, parentCategoryDocument);
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory({
                ...req,
                extraProperty: 'extra',
              } as any);
  
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: undefined,
              }));

              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: <any>1,
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: '',
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different category', async ({ requestCreateCategory, saveCategory }) => {
              const categoryDocument = categoryDataFactory.document({
                body: req,
              });

              await saveCategory(categoryDocument);

              const res = await requestCreateCategory(req);
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveMessage('Duplicate category name');
            });
          });

          test.describe('if categoryType', () => {
            test('is missing from body', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: undefined,
              }));

              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveRequiredPropertyValidationError('body', 'categoryType');
            });

            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: <any>1,
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveWrongTypeValidationError('body', 'categoryType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: <any>'not-category-type',
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveEnumValidationError('body', 'categoryType');
            });
          });

          test.describe('if parentCategoryId', () => {
            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: <any>1,
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveWrongTypeValidationError('body', 'parentCategoryId', 'string');
            });

            test('does not match pattern', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: <any>'not-mongo-id',
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHavePatternValidationError('body', 'parentCategoryId');
            });

            test('does not belong to any category', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: categoryDataFactory.id(),
              }));
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHaveMessage('Parent category not found');
            });
          });
        });
      }
    });
  }
});
