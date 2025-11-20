import { default as schema } from '@household/shared/schemas/calendar-day-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar workday request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.WorkdayRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.day.request.workday());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.day.request.workday(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required(testDataFactory.calendar.day.request.workday({
        dayType: undefined,
      }), 'dayType');

      tester.type(testDataFactory.calendar.day.request.workday({
        dayType: 1 as any,
      }), 'dayType', 'string');

      tester.const(testDataFactory.calendar.day.request.workday({
        dayType: 'not-enum-value' as any,
      }), 'dayType');
    });

    describe('if data.start', () => {
      tester.required(testDataFactory.calendar.day.request.workday({
        start: undefined,
      }), 'start');

      tester.type(testDataFactory.calendar.day.request.workday({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(testDataFactory.calendar.day.request.workday({
        start: -1,
      }), 'start', 0);

      tester.maximum(testDataFactory.calendar.day.request.workday({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(testDataFactory.calendar.day.request.workday({
        end: undefined,
      }), 'end');

      tester.type(testDataFactory.calendar.day.request.workday({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(testDataFactory.calendar.day.request.workday({
        end: -1,
      }), 'end', 0);

      tester.maximum(testDataFactory.calendar.day.request.workday({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(testDataFactory.calendar.day.request.workday({
        start: 50,
        end: 49,
      }), 'end', 50);
    });
  });
});

describe('Calendar vacation request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.VacationRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.day.request.vacation());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.day.request.vacation(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required({
        ...testDataFactory.calendar.day.request.vacation(),
        dayType: undefined,
      }, 'dayType');

      tester.type({
        ...testDataFactory.calendar.day.request.vacation(),
        dayType: 1 as any,
      }, 'dayType', 'string');

      tester.const({
        ...testDataFactory.calendar.day.request.vacation(),
        dayType: 'not-enum-value' as any,
      }, 'dayType');
    });
  });
});
