import { entries, getCategoryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test as categoryApiTest, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Category } from '@household/shared/types/types';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(categoryApiExpect, apiExpect);

const test = mergeTests(categoryApiTest, categoryDbTest);

test.describe('POST /category/v1/categories', () => {
  let req: Category.Request;
  let parentCategoryDocument: Category.Document;
  let grandparentCategoryDocument: Category.Document;

  test.beforeEach(async () => {
    req = categoryDataFactory.request();

    grandparentCategoryDocument = categoryDataFactory.document();
    parentCategoryDocument = categoryDataFactory.document({
      parentCategory: grandparentCategoryDocument,
    });
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateCategory }) => {
      const res = await requestCreateCategory(req);
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
        test('should return forbidden', async ({ requestCreateCategory }) => {
          const res = await requestCreateCategory(req);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create category', async ({ requestCreateCategory, findCategoryById }) => {
          test.step('logging 1', () => {
            
          });
          const res = await requestCreateCategory(req);
          expect(res).toBeCreatedResponse();

          const { categoryId } = (await res.json()) as Category.CategoryId;
          expect(req).toHaveBeenSavedAsCategoryDocument(await findCategoryById(categoryId));
        });

        test('should create category with parent category', async ({ requestCreateCategory, saveCategories, findCategoryById }) => {
          req = categoryDataFactory.request({
            parentCategoryId: getCategoryId(parentCategoryDocument),
          });

          await saveCategories(grandparentCategoryDocument, parentCategoryDocument);

          const res = await requestCreateCategory(req);
          expect(res).toBeCreatedResponse();

          const { categoryId } = (await res.json()) as Category.CategoryId;
          expect(req).toHaveBeenSavedAsCategoryDocument(await findCategoryById(categoryId), grandparentCategoryDocument, parentCategoryDocument);
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory({
                ...req,
                extraProperty: 'extra',
              } as any);
  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: undefined,
              }));

              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                name: '',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different category', async ({ requestCreateCategory, saveCategory }) => {
              const categoryDocument = categoryDataFactory.document({
                body: req,
              });

              await saveCategory(categoryDocument);

              const res = await requestCreateCategory(req);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate category name');
            });
          });

          test.describe('if categoryType', () => {
            test('is missing from body', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: undefined,
              }));

              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'categoryType');
            });

            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                categoryType: <any>'not-category-type',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'categoryType');
            });
          });

          test.describe('if parentCategoryId', () => {
            test('is not string', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'parentCategoryId', 'string');
            });

            test('does not match pattern', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: <any>'not-mongo-id',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'parentCategoryId');
            });

            test('does not belong to any category', async ({ requestCreateCategory }) => {
              const res = await requestCreateCategory(categoryDataFactory.request({
                parentCategoryId: categoryDataFactory.id(),
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Parent category not found');
            });
          });
        });
      }
    });
  }
});
