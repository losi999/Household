import { default as schema } from '@household/shared/schemas/date-range';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { Calendar } from '@household/shared/types/types';

describe('Date range schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.DateRange>(schema);

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
