import { default as schema } from '@household/shared/schemas/category-request';
import { Category } from '@household/shared/types/types';
import { createCategoryId, createCategoryRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category schema', () => {
  const tester = jsonSchemaTesterFactory<Category.Request>(schema);

  tester.validateSuccess(createCategoryRequest());

  describe('should accept', () => {
    describe('without optional property', () => {
      tester.validateSuccess(createCategoryRequest({
        parentCategoryId: undefined,
      }));
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createCategoryRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.validateSchemaRequired(createCategoryRequest({
        name: undefined,
      }), 'name');

      tester.validateSchemaType(createCategoryRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.validateSchemaMinLength(createCategoryRequest({
        name: '',
      }), 'name', 1);

    });

    describe('if data.categoryType', () => {
      tester.validateSchemaRequired(createCategoryRequest({
        categoryType: undefined,
      }), 'categoryType');

      tester.validateSchemaType(createCategoryRequest({
        categoryType: 1 as any,
      }), 'categoryType', 'string');

      tester.validateSchemaEnumValue(createCategoryRequest({
        categoryType: 'not-valid' as any,
      }), 'categoryType');
    });

    describe('if data.parentCategoryId', () => {
      tester.validateSchemaType(createCategoryRequest({
        parentCategoryId: 1 as any,
      }), 'parentCategoryId', 'string');

      tester.validateSchemaPattern(createCategoryRequest({
        parentCategoryId: createCategoryId('not-valid'),
      }), 'parentCategoryId');

    });
  });
});
