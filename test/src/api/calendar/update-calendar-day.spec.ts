import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar } from '@household/shared/types/types';
import { calendarDayDataFactory } from '@household/test/api/calendar/data-factory';

import { test as calendarApiTest, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as calendarDayDbTest } from '@household/test/fixtures/calendar-day-db.fixture';

const test = mergeTests(calendarApiTest, calendarDayDbTest);

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe.serial('PUT /calendar/v1/days/{day}', () => {
  let request: Calendar.Day.Request;
  let day: string;
  let calendarDayDocument: Calendar.Day.Document;

  test.beforeEach(async () => {
    request = calendarDayDataFactory.request.workday();
    day = calendarDayDataFactory.futureDay();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCalendarDay }) => {
      const res = await requestUpdateCalendarDay(day, request);
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
        test('should return forbidden', async ({ requestUpdateCalendarDay }) => {
          const res = await requestUpdateCalendarDay(day, request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should save previously unset day to', () => {
          test('workday', async ({ requestUpdateCalendarDay, clearCalendarDay, findCalendarDayByDay }) => {
            await clearCalendarDay(day);

            const res = await requestUpdateCalendarDay(day, request);
            expect(res).toBeNoContentResponse();

            expect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
          
          test('vacation', async ({ requestUpdateCalendarDay, clearCalendarDay, findCalendarDayByDay }) => {
            request = calendarDayDataFactory.request.vacation();
            await clearCalendarDay(day);
            
            const res = await requestUpdateCalendarDay(day, request);
            expect(res).toBeNoContentResponse();

            expect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
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
            expect(res).toBeNoContentResponse();

            expect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
          });
          
          test('vacation to workday', async ({ requestUpdateCalendarDay, findCalendarDayByDay, saveCalendarDay }) => {
            calendarDayDocument = calendarDayDataFactory.document.vacation({
              day,
            });

            request = calendarDayDataFactory.request.workday();

            await saveCalendarDay(calendarDayDocument);
            const res = await requestUpdateCalendarDay(day, request);
            expect(res).toBeNoContentResponse();

            expect(request).toHaveBeenSavedAsCalendarDayDocument(await findCalendarDayByDay(day));
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
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Selected calendar day is a national holiday');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, {
                ...request,
                extraProperty: 'extra',
              } as any);
            
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if dayType', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'dayType');
            });

            test('is not string', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'dayType', 'string');
            });

            test('is not a valid constant value', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                dayType: 'not-valid-const' as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveConstantValueValidationError('body', 'dayType');
            });
          });

          test.describe('if start', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'start');
            });

            test('is not integer', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 1.1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'start', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: -1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooSmallValidationError('body', 'start', 0);
            });

            test('is too large', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 97, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'start', 96);
            });
          });

          test.describe('if end', () => {
            test('is missing from body', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'end');
            });

            test('is not integer', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: 1.1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'end', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                start: 20,
                end: 10, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'end', 20);
            });

            test('is too large', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay(day, calendarDayDataFactory.request.workday({
                end: 97, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'end', 96);
            });
          });

          test.describe('if day', () => {
            test('is not date', async ({ requestUpdateCalendarDay }) => {
              const res = await requestUpdateCalendarDay('not-date', request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('pathParameters', 'day', 'date');
            });
          });
        });
      }
    });
  });
});
