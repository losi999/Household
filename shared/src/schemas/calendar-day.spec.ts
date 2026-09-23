import { day as schema } from '@household/shared/schemas/calendar';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Calendar day schema', () => {
  const tester = schemaTesterFactory<Api.Calendar.Day>(schema);
  const day = '2025-10-10';
  tester.validateSuccess({
    day,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        day,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required({
        day: undefined,
      }, 'day');

      tester.type({
        day: 1 as any,
      }, 'day', 'string');

      tester.format({
        day: 'not-a-date',
      }, 'day', 'date');
    });
  });
});
