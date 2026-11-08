import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

import { calendarApiTest, calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeTests } from '@playwright/test';
import { calendarDayDbTest } from '@household/test/fixtures/calendar-day-db.fixture';
import { DAY_END, DAY_START } from '@household/shared/constants';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const test = mergeTests(calendarApiTest, calendarDayDbTest);

const permissionMap = allowUsers('hairdresser');

test.describe.serial('PUT /calendar/v1/days/{day}', () => {
  let request: Requests.CalendarDay;
  let day: string;
  let calendarDayDocument: Documents.CalendarDay;

  test.beforeEach(async () => {
    request = calendarDayDataFactory.request.workday();
    day = calendarDayDataFactory.futureDay();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCalendarDay }) => {
      const res = await requestUpdateCalendarDay(day, request);
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
        test('should return forbidden', async ({ requestUpdateCalendarDay }) => {
          const res = await requestUpdateCalendarDay(day, request);
          calendarApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should save previously unset day to', () => {
          test('workday', async ({ requestUpdateCalendarDay, clearCalendarDay, findCalendarDayByDay }) => {
            await clearCalendarDay(day);

            const res = await requestUpdateCalendarDay(day, request);
            calendarApiExpect(res).toBeNoContentResponse();

            calendarApiExpect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
          
          test('vacation', async ({ requestUpdateCalendarDay, clearCalendarDay, findCalendarDayByDay }) => {
            request = calendarDayDataFactory.request.vacation();
            await clearCalendarDay(day);
            
            const res = await requestUpdateCalendarDay(day, request);
            calendarApiExpect(res).toBeNoContentResponse();

            calendarApiExpect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
        });

        test.describe('should update', () => {  
          test('workday to vacation', async ({ requestUpdateCalendarDay, findCalendarDayByDay, saveCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.work({
              day,
            });

            request = calendarDayDataFactory.request.vacation();

            await saveCalendarDay(calendarDayDocument);
            const res = await requestUpdateCalendarDay(day, request);
            calendarApiExpect(res).toBeNoContentResponse();

            calendarApiExpect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
          
          test('vacation to workday', async ({ requestUpdateCalendarDay, findCalendarDayByDay, saveCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.vacation({
              day,
            });

            request = calendarDayDataFactory.request.workday();

            await saveCalendarDay(calendarDayDocument);
            const res = await requestUpdateCalendarDay(day, request);
            calendarApiExpect(res).toBeNoContentResponse();

            calendarApiExpect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
        });

        test.describe('should return error', () => {
          test('if holiday is to be updated', async ({ requestUpdateCalendarDay, saveCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.holiday({
              day,
            });

            request = calendarDayDataFactory.request.workday();

            await saveCalendarDay(calendarDayDocument);
            const res = await requestUpdateCalendarDay(day, request);
            calendarApiExpect(res).toBeBadRequestResponse();
            calendarApiExpect(res).toHaveMessage('Selected calendar day is a national holiday');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, {
                ...request,
                extraProperty: 'extra',
              } as any);
            
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if dayType', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: undefined, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'dayType');
            });

            test('is not string', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: <any>1, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'dayType', 'string');
            });

            test('is not a valid constant value', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: 'not-valid-const' as any, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveEnumValidationError('body', 'dayType');
            });
          });

          test.describe('if start', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: undefined, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'start');
            });

            test('is not integer', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 1.1, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'start', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: -1, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooSmallValidationError('body', 'start', DAY_START);
            });

            test('is too large', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 97, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooLargeValidationError('body', 'start', DAY_END);
            });
          });

          test.describe('if end', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: undefined, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'end');
            });

            test('is not integer', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: 1.1, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'end', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 20,
                end: 10, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'end', 20);
            });

            test('is too large', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: 97, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooLargeValidationError('body', 'end', DAY_END);
            });
          });

          test.describe('if day', () => {
            test('is not date', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay('not-date', request);
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongFormatValidationError('pathParameters', 'day', 'date');
            });
          });
        });
      }
    });
  });
});
