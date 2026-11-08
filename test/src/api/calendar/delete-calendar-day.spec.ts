import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

import { calendarApiTest, calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeTests } from '@playwright/test';
import { calendarDayDbTest } from '@household/test/fixtures/calendar-day-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, calendarDayDbTest);

test.describe('DELETE /calendar/v1/days/{day}', () => {
  let day: string;
  let calendarDayDocument: Documents.CalendarDay;

  test.beforeEach(async () => {
    calendarDayDocument = calendarDayDataFactory.document.work();
    day = calendarDayDocument.day;
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCalendarDay }) => {
      const res = await requestDeleteCalendarDay(day);
      calendarApiExpect(res).toBeUnauthorizedResponse();
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
          calendarApiExpect(res).toBeForbiddenResponse();
        });
      } else {  
        test('should delete calendar day', async ({ requestDeleteCalendarDay, findCalendarDayByDay, saveCalendarDay }) => {
          await saveCalendarDay(calendarDayDocument);
          const res = await requestDeleteCalendarDay(day);
          calendarApiExpect(res).toBeNoContentResponse();
          calendarApiExpect(await findCalendarDayByDay(day)).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should return error', () => {
          test('if holiday is to be deleted', async ({ requestDeleteCalendarDay, saveCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.holiday({
              day,
            });

            await saveCalendarDay(calendarDayDocument);
            const res = await requestDeleteCalendarDay(day);
            calendarApiExpect(res).toBeBadRequestResponse();
            calendarApiExpect(res).toHaveMessage('Selected calendar day is a national holiday');
          });

          test.describe('if day', () => {
            test('is not date', async ({ requestDeleteCalendarDay }) => {
              const res = await requestDeleteCalendarDay('not-date');
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongFormatValidationError('pathParameters', 'day', 'date');
            });
          });
        });
      }
    });
  });
});
