import { default as schema } from '@household/shared/schemas/calendar-entry-resolution-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar entry resolution request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.ResolutionRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.entry.resolution.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.entry.resolution.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.status', () => {
      tester.required(testDataFactory.calendar.entry.resolution.request({
        status: undefined,
      }), 'status');

      tester.type(testDataFactory.calendar.entry.resolution.request({
        status: 1 as any,
      }), 'status', 'string');

      tester.const(testDataFactory.calendar.entry.resolution.request({
        status: 'not-enum' as any,
      }), 'status');
    });

    describe('if data.amount', () => {
      tester.required(testDataFactory.calendar.entry.resolution.request({
        amount: undefined,
      }), 'amount');

      tester.type(testDataFactory.calendar.entry.resolution.request({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.delay', () => {
      tester.type(testDataFactory.calendar.entry.resolution.request({
        delay: '1' as any,
      }), 'delay', 'integer');

      tester.exclusiveMinimum(testDataFactory.calendar.entry.resolution.request({
        delay: 0,
      }), 'delay', 0);
    });
  });
});
