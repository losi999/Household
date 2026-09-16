import { default as schema } from '@household/shared/schemas/pagination';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Pagination schema', () => {
  const tester = schemaTesterFactory<Api.Pagination<string>>(schema);

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
      tester.dependentRequired({
        pageNumber: '1',
        pageSize: undefined,
      }, 'pageNumber', 'pageSize');

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
      tester.dependentRequired({
        pageNumber: undefined,
        pageSize: '23',
      }, 'pageSize', 'pageNumber');

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
