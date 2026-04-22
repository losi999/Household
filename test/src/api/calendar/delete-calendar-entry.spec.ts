import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar, Customer } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

import { test as calendarApiTest, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, calendarEntryDbTest, customerDbTest);

test.describe('DELETE /calendar/v1/entries/{calendarEntryId}', () => {
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
          
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCalendarEntry }) => {
      const res = await requestDeleteCalendarEntry(calendarEntryDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteCalendarEntry }) => {
          const res = await requestDeleteCalendarEntry(calendarEntryDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should delete calendar', () => {
          test('personal entry', async ({ requestDeleteCalendarEntry, saveCalendarEntry, getCalendarEntryById }) => {
            await saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await getCalendarEntryById(getCalendarEntryId(calendarPersonalEntryDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('issue entry', async ({ requestDeleteCalendarEntry, saveCalendarEntry, getCalendarEntryById }) => {                        
            await saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await getCalendarEntryById(getCalendarEntryId(calendarIssueEntryDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('work entry', async ({ requestDeleteCalendarEntry, saveCalendarEntry, getCalendarEntryById, saveCustomer }) => {          
            await saveCalendarEntry(calendarWorkEntryDocument);
            await saveCustomer(customerDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument))).toHaveBeenDeletedFromDatabase();
          });
        });

        test.describe('should return error', () => {    
          test('if work entry is already resolved', async ({ requestDeleteCalendarEntry, saveCalendarEntry }) => {      
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });       
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument));
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Calendar entry is already resolved');
          });

          test.describe('if calendarEntryId', () => {
            test('is not mongo id', async ({ requestDeleteCalendarEntry }) => {
              const res = await requestDeleteCalendarEntry(calendarEntryDataFactory.id('not-mongo-id'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'calendarEntryId');
            });
          }); 
        });
      }
    });
  });
});
