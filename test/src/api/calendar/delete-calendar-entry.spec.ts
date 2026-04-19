import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar, Customer } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

import { test, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { calendarEntryService, customerService } from '@household/test/dependencies';

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

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
          test('personal entry', async ({ requestDeleteCalendarEntry }) => {
            await calendarEntryService.saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarPersonalEntryDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('issue entry', async ({ requestDeleteCalendarEntry }) => {                        
            await calendarEntryService.saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarIssueEntryDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('work entry', async ({ requestDeleteCalendarEntry }) => {          
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            await customerService.saveCustomer(customerDocument);
            const res = await requestDeleteCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument));
            expect(res).toBeNoContentResponse();

            expect(await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument))).toHaveBeenDeletedFromDatabase();
          });
        });

        test.describe('should return error', () => {    
          test('if work entry is already resolved', async ({ requestDeleteCalendarEntry }) => {      
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });       
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
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
