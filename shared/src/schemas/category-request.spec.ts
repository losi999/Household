import { request as schema } from '@household/shared/schemas/category';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Category request schema', () => {
  const tester = schemaTesterFactory<Requests.Category>(schema);

  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.category.request());

    tester.validateSuccess(testDataFactory.category.request({
      parentCategoryId: undefined,
    }), 'without parentCategoryId');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.category.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.category.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.category.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.category.request({
        name: '',
      }), 'name', 1);

    });

    describe('if data.categoryType', () => {
      tester.required(testDataFactory.category.request({
        categoryType: undefined,
      }), 'categoryType');

      tester.type(testDataFactory.category.request({
        categoryType: 1 as any,
      }), 'categoryType', 'string');

      tester.enum(testDataFactory.category.request({
        categoryType: 'not-valid' as any,
      }), 'categoryType');
    });

    describe('if data.parentCategoryId', () => {
      tester.type(testDataFactory.category.request({
        parentCategoryId: 1 as any,
      }), 'parentCategoryId', 'string');

      tester.pattern(testDataFactory.category.request({
        parentCategoryId: testDataFactory.category.id('not-valid'),
      }), 'parentCategoryId');

    });
  });
});
