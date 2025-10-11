import { default as schema } from '@household/shared/schemas/calendar-day-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { calendarDayDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar workday request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.WorkdayRequest>(schema);
  tester.validateSuccess(calendarDayDataFactory.workdayRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarDayDataFactory.workdayRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required(calendarDayDataFactory.workdayRequest({
        dayType: undefined,
      }), 'dayType');

      tester.type(calendarDayDataFactory.workdayRequest({
        dayType: 1 as any,
      }), 'dayType', 'string');

      tester.const(calendarDayDataFactory.workdayRequest({
        dayType: 'not-enum-value' as any,
      }), 'dayType');
    });

    describe('if data.start', () => {
      tester.required(calendarDayDataFactory.workdayRequest({
        start: undefined,
      }), 'start');

      tester.type(calendarDayDataFactory.workdayRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(calendarDayDataFactory.workdayRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(calendarDayDataFactory.workdayRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(calendarDayDataFactory.workdayRequest({
        end: undefined,
      }), 'end');

      tester.type(calendarDayDataFactory.workdayRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(calendarDayDataFactory.workdayRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(calendarDayDataFactory.workdayRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(calendarDayDataFactory.workdayRequest({
        start: 50,
        end: 49,
      }), 'end', 50);
    });
  });
});

describe('Calendar vacation request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.VacationRequest>(schema);
  tester.validateSuccess(calendarDayDataFactory.vacationRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarDayDataFactory.vacationRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required(calendarDayDataFactory.vacationRequest({
        dayType: undefined,
      }), 'dayType');

      tester.type(calendarDayDataFactory.vacationRequest({
        dayType: 1 as any,
      }), 'dayType', 'string');

      tester.const(calendarDayDataFactory.vacationRequest({
        dayType: 'not-enum-value' as any,
      }), 'dayType');
    });
  });
});
