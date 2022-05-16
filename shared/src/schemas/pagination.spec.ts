import { default as schema } from '@household/shared/schemas/pagination';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Pagination schema', () => {
  let data: {
    pageSize: string;
    pageNumber: string;
  };
  const tester = jsonSchemaTesterFactory<{
    pageSize: string;
    pageNumber: string;
  }>(schema);

  beforeEach(() => {
    data = {
      pageNumber: '1',
      pageSize: '23',
    };
  });

  it('should accept valid body', () => {
    tester.validateSuccess(data);
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.pageNumber', () => {
      it('is missing', () => {
        data.pageNumber = undefined;
        tester.validateSchemaRequired(data, 'pageNumber');
      });

      it('does not match pattern', () => {
        data.pageNumber = 'asd';
        tester.validateSchemaPattern(data, 'pageNumber');
      });
    });

    describe('if data.pageSize', () => {
      it('is missing', () => {
        data.pageSize = undefined;
        tester.validateSchemaRequired(data, 'pageSize');
      });

      it('does not match pattern', () => {
        data.pageSize = 'asd';
        tester.validateSchemaPattern(data, 'pageSize');
      });
    });
  });
});
