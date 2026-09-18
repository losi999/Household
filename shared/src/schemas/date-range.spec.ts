import { dateRange as schema } from '@household/shared/schemas/calendar';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Date range schema', () => {
  const tester = schemaTesterFactory<Api.Calendar.DateRange>(schema);

  const dateFrom = '2025-10-10';
  const dateTo = '2025-10-15';

  tester.validateSuccess({
    dateFrom,
    dateTo,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        dateFrom, 
        dateTo,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dateFrom', () => {
      tester.required({
        dateFrom: undefined, 
        dateTo,
      }, 'dateFrom');

      tester.type({
        dateFrom: 1 as any, 
        dateTo,
      }, 'dateFrom', 'string');

      tester.format({
        dateFrom: 'not-a-date', 
        dateTo,
      }, 'dateFrom', 'date');
    });

    describe('if data.dateTo', () => {
      tester.required({
        dateFrom, 
        dateTo: undefined,
      }, 'dateTo');

      tester.type({
        dateFrom, 
        dateTo: 1 as any,
      }, 'dateTo', 'string');

      tester.format({
        dateFrom, 
        dateTo: 'not-a-date',
      }, 'dateTo', 'date');

      tester.formatExclusiveMinimum({
        dateFrom,
        dateTo: '2025-09-10',
      }, 'dateTo');
    });
  });
});
