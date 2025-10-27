import { default as schema } from '@household/shared/schemas/calendar-entry-resolution-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { calendarEntryDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar entry resolution request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.ResolutionRequest>(schema);
  tester.validateSuccess(calendarEntryDataFactory.resolutionRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarEntryDataFactory.resolutionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.status', () => {
      tester.required(calendarEntryDataFactory.resolutionRequest({
        status: undefined,
      }), 'status');

      tester.type(calendarEntryDataFactory.resolutionRequest({
        status: 1 as any,
      }), 'status', 'string');

      tester.const(calendarEntryDataFactory.resolutionRequest({
        status: 'not-enum' as any,
      }), 'status');
    });

    describe('if data.amount', () => {
      tester.required(calendarEntryDataFactory.resolutionRequest({
        amount: undefined,
      }), 'amount');

      tester.type(calendarEntryDataFactory.resolutionRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.delay', () => {
      tester.type(calendarEntryDataFactory.resolutionRequest({
        delay: '1' as any,
      }), 'delay', 'integer');

      tester.exclusiveMinimum(calendarEntryDataFactory.resolutionRequest({
        delay: 0,
      }), 'delay', 0);
    });
  });
});
