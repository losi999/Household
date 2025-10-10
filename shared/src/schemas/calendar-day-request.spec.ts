import { default as schema } from '@household/shared/schemas/calendar-day-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createCalendarVacationRequest, createCalendarWorkdayRequest } from '@household/shared/common/test-data-factory';

describe('Calendar workday request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.WorkdayRequest>(schema);
  tester.validateSuccess(createCalendarWorkdayRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarWorkdayRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required(createCalendarWorkdayRequest({
        dayType: undefined,
      }), 'dayType');

      tester.type(createCalendarWorkdayRequest({
        dayType: 1 as any,
      }), 'dayType', 'string');

      tester.const(createCalendarWorkdayRequest({
        dayType: 'not-enum-value' as any,
      }), 'dayType');
    });

    describe('if data.start', () => {
      tester.required(createCalendarWorkdayRequest({
        start: undefined,
      }), 'start');

      tester.type(createCalendarWorkdayRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(createCalendarWorkdayRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(createCalendarWorkdayRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(createCalendarWorkdayRequest({
        end: undefined,
      }), 'end');

      tester.type(createCalendarWorkdayRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(createCalendarWorkdayRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(createCalendarWorkdayRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(createCalendarWorkdayRequest({
        start: 50,
        end: 49,
      }), 'end', 50);
    });
  });
});

describe('Calendar vacation request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Day.VacationRequest>(schema);
  tester.validateSuccess(createCalendarVacationRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarVacationRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.dayType', () => {
      tester.required(createCalendarVacationRequest({
        dayType: undefined,
      }), 'dayType');

      tester.type(createCalendarVacationRequest({
        dayType: 1 as any,
      }), 'dayType', 'string');

      tester.const(createCalendarVacationRequest({
        dayType: 'not-enum-value' as any,
      }), 'dayType');
    });
  });
});
