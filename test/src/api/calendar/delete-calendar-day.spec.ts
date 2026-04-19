import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar } from '@household/shared/types/types';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

import { test, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { calendarDayService } from '@household/test/dependencies';

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('DELETE /calendar/v1/days/{day}', () => {
  let day: string;
  let calendarDayDocument: Calendar.Day.Document;

  test.beforeEach(async () => {
    calendarDayDocument = calendarDayDataFactory.document.work();
    day = calendarDayDocument.day;
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCalendarDay }) => {
      const res = await requestDeleteCalendarDay(day);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestDeleteCalendarDay }) => {
          const res = await requestDeleteCalendarDay(day);
          expect(res).toBeForbiddenResponse();
        });
      } else {  
        test('should delete calendar day', async ({ requestDeleteCalendarDay }) => {
          await calendarDayService.saveCalendarDay(calendarDayDocument);
          const res = await requestDeleteCalendarDay(day);
          expect(res).toBeNoContentResponse();
          expect(await calendarDayService.findCalendarDayByDay(day)).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should return error', () => {
          test('if holiday is to be deleted', async ({ requestDeleteCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.holiday({
              day,
            });

            await calendarDayService.saveCalendarDay(calendarDayDocument);
            const res = await requestDeleteCalendarDay(day);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Selected calendar day is a national holiday');
          });

          test.describe('if day', () => {
            test('is not date', async ({ requestDeleteCalendarDay }) => {
              const res = await requestDeleteCalendarDay('not-date');
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('pathParameters', 'day', 'date');
            });
          });
        });
      }
    });
  });
});
