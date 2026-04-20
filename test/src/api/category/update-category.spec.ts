import { getCategoryId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Category } from '@household/shared/types/types';
import { mergeExpects } from '@playwright/test';
import { categoryService } from '@household/test/dependencies';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(categoryApiExpect, apiExpect);

test.describe('PUT /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;
  let req: Category.Request;

  test.beforeEach(async () => {
    req = categoryDataFactory.request();

    categoryDocument = categoryDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCategory }) => {
      const res = await requestUpdateCategory(categoryDataFactory.id(), req);
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
        test('should return forbidden', async ({ requestUpdateCategory }) => {
          const res = await requestUpdateCategory(categoryDataFactory.id(), req);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update a category', async ({ requestUpdateCategory }) => {
          await categoryService.saveCategory(categoryDocument);

          const res = await requestUpdateCategory(getCategoryId(categoryDocument), req);
          expect(res).toBeCreatedResponse();

          const { categoryId } = (await res.json()) as Category.CategoryId;
          expect(req).toHaveBeenSavedAsCategoryDocument(await categoryService.findCategoryById(categoryId));
        });

        test.describe('children should be reassigned', () => {
          let childCategory: Category.Document;
          let grandChildCategory: Category.Document;
          let otherParentCategory: Category.Document;

          test.beforeEach(async () => {
            childCategory = categoryDataFactory.document({
              parentCategory: categoryDocument,
            });

            grandChildCategory = categoryDataFactory.document({
              parentCategory: childCategory,
            });

            otherParentCategory = categoryDataFactory.document();
          });

          test('to a different parent category', async ({ requestUpdateCategory }) => {
            req = categoryDataFactory.request({
              parentCategoryId: getCategoryId(otherParentCategory),
            });

            await categoryService.saveCategories(categoryDocument, childCategory, grandChildCategory, otherParentCategory);

            const res = await requestUpdateCategory(getCategoryId(childCategory), req);
            expect(res).toBeCreatedResponse();

            expect(req).toHaveBeenSavedAsCategoryDocument(await categoryService.findCategoryById(getCategoryId(childCategory)), otherParentCategory, ...otherParentCategory.ancestors);
            expect(grandChildCategory).toHaveItsParentReassigned(await categoryService.findCategoryById(getCategoryId(grandChildCategory)), await categoryService.findCategoryById(getCategoryId(childCategory)));
          });

          test('to root from previously set parent', async ({ requestUpdateCategory }) => {
            req = categoryDataFactory.request({
              parentCategoryId: undefined,
            });

            await categoryService.saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestUpdateCategory(getCategoryId(childCategory), req);
            expect(res).toBeCreatedResponse();

            expect(req).toHaveBeenSavedAsCategoryDocument(await categoryService.findCategoryById(getCategoryId(childCategory)));
          });

          test('to a parent from previously unset value', async ({ requestUpdateCategory }) => {
            req = categoryDataFactory.request({
              parentCategoryId: getCategoryId(otherParentCategory),
            });

            await categoryService.saveCategories(categoryDocument, childCategory, grandChildCategory, otherParentCategory);

            const res = await requestUpdateCategory(getCategoryId(categoryDocument), req);
            expect(res).toBeCreatedResponse();
            expect(req).toHaveBeenSavedAsCategoryDocument(await categoryService.findCategoryById(getCategoryId(categoryDocument)), otherParentCategory, ...otherParentCategory.ancestors);
            expect(childCategory).toHaveItsParentReassigned(await categoryService.findCategoryById(getCategoryId(childCategory)), await categoryService.findCategoryById(getCategoryId(categoryDocument)));
            expect(grandChildCategory).toHaveItsParentReassigned(await categoryService.findCategoryById(getCategoryId(grandChildCategory)), await categoryService.findCategoryById(getCategoryId(childCategory)));
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), {
                ...req,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                name: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                name: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                name: '',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different category', async ({ requestUpdateCategory }) => {
              const duplicateCategoryDocument = categoryDataFactory.document({
                body: req,
              });

              await categoryService.saveCategories(duplicateCategoryDocument, categoryDocument);

              const res = await requestUpdateCategory(getCategoryId(categoryDocument), req);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate category name');
            });
          });

          test.describe('if categoryType', () => {
            test('is missing from body', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                categoryType: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'categoryType');
            });

            test('is not string', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                categoryType: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryType', 'string');
            });

            test('is not a valid enum value', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                categoryType: <any>'not-category-type',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'categoryType');
            });
          });

          test.describe('if parentCategoryId', () => {
            test('is not string', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                parentCategoryId: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'parentCategoryId', 'string');
            });

            test('does not match pattern', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), categoryDataFactory.request({
                parentCategoryId: <any>'not-mongo-id',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'parentCategoryId');
            });

            test('does not belong to any category', async ({ requestUpdateCategory }) => {
              await categoryService.saveCategory(categoryDocument);

              const res = await requestUpdateCategory(getCategoryId(categoryDocument), categoryDataFactory.request({
                parentCategoryId: categoryDataFactory.id(),
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Parent category not found');
            });

            test('belongs to the category to be updated', async ({ requestUpdateCategory }) => {
              await categoryService.saveCategory(categoryDocument);

              const res = await requestUpdateCategory(getCategoryId(categoryDocument), categoryDataFactory.request({
                parentCategoryId: getCategoryId(categoryDocument),
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Parent category cannot be the category itself');
            });

            test('is already a descendent category', async ({ requestUpdateCategory }) => {
              const childCategoryDocument = categoryDataFactory.document({
                parentCategory: categoryDocument,
              });

              await categoryService.saveCategories(categoryDocument, childCategoryDocument);

              const res = await requestUpdateCategory(getCategoryId(categoryDocument), categoryDataFactory.request({
                parentCategoryId: getCategoryId(childCategoryDocument),
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Parent category is already a child of the current category');
            });
          });

          test.describe('if categoryId', () => {
            test('is not mongo id', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory('not-valid' as Category.Id, req);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });

            test('does not belong to any category', async ({ requestUpdateCategory }) => {
              const res = await requestUpdateCategory(categoryDataFactory.id(), req);
              expect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  }
});
