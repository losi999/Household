import { default as schema } from '@household/shared/schemas/category';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category schema', () => {
  let data: Category.Request;
  const tester = jsonSchemaTesterFactory<Category.Request>(schema);

  beforeEach(() => {
    data = {
      name: 'name',
      categoryType: 'regular',
      parentCategoryId: createCategoryId(),
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      tester.validateSuccess(data);
    });

    describe('without optional property', () => {
      it('parentCategoryId', () => {
        delete data.parentCategoryId;
        tester.validateSuccess(data);
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        tester.validateSchemaRequired(data, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        tester.validateSchemaType(data, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        tester.validateSchemaMinLength(data, 'name', 1);
      });
    });

    describe('if data.categoryType', () => {
      it('is missing', () => {
        data.categoryType = undefined;
        tester.validateSchemaRequired(data, 'categoryType');
      });

      it('is not string', () => {
        (data.categoryType as any) = 2;
        tester.validateSchemaType(data, 'categoryType', 'string');
      });

      it('is not valid enum value', () => {
        data.categoryType = 'not-valid' as any;
        tester.validateSchemaEnumValue(data, 'categoryType');
      });
    });

    describe('if data.parentCategoryId', () => {
      it('is not string', () => {
        (data.parentCategoryId as any) = 2;
        tester.validateSchemaType(data, 'parentCategoryId', 'string');
      });

      it('does not match pattern', () => {
        data.parentCategoryId = createCategoryId('not-valid');
        tester.validateSchemaPattern(data, 'parentCategoryId');
      });
    });
  });
});
