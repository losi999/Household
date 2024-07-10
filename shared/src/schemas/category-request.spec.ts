import { default as schema } from '@household/shared/schemas/category-request';
import { Category } from '@household/shared/types/types';
import { createCategoryId, createCategoryRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category request schema', () => {
  const tester = jsonSchemaTesterFactory<Category.Request>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createCategoryRequest());

    tester.validateSuccess(createCategoryRequest({
      parentCategoryId: undefined,
    }), 'without parentCategoryId');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCategoryRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createCategoryRequest({
        name: undefined,
      }), 'name');

      tester.type(createCategoryRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createCategoryRequest({
        name: '',
      }), 'name', 1);

    });

    describe('if data.categoryType', () => {
      tester.required(createCategoryRequest({
        categoryType: undefined,
      }), 'categoryType');

      tester.type(createCategoryRequest({
        categoryType: 1 as any,
      }), 'categoryType', 'string');

      tester.enum(createCategoryRequest({
        categoryType: 'not-valid' as any,
      }), 'categoryType');
    });

    describe('if data.parentCategoryId', () => {
      tester.type(createCategoryRequest({
        parentCategoryId: 1 as any,
      }), 'parentCategoryId', 'string');

      tester.pattern(createCategoryRequest({
        parentCategoryId: createCategoryId('not-valid'),
      }), 'parentCategoryId');

    });
  });
});
