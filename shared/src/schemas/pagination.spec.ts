import { default as schema } from '@household/shared/schemas/pagination';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { Common } from '@household/shared/types/types';

describe('Pagination schema', () => {
  const tester = jsonSchemaTesterFactory<Common.Pagination<string>>(schema);

  tester.validateSuccess({
    pageNumber: '1',
    pageSize: '23',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        pageNumber: '1',
        pageSize: '23',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.pageNumber', () => {
      tester.required({
        pageNumber: undefined,
        pageSize: '23',
      }, 'pageNumber');

      tester.type({
        pageNumber: 1 as any,
        pageSize: '23',
      }, 'pageNumber', 'string');

      tester.pattern({
        pageNumber: 'asd',
        pageSize: '23',
      }, 'pageNumber');
    });

    describe('if data.pageSize', () => {
      tester.required({
        pageNumber: '1',
        pageSize: undefined,
      }, 'pageSize');

      tester.type({
        pageNumber: '1',
        pageSize: 23 as any,
      }, 'pageSize', 'string');

      tester.pattern({
        pageNumber: '1',
        pageSize: 'asd',
      }, 'pageSize');
    });
  });
});
