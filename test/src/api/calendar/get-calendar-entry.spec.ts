import { entries, getCalendarEntryId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { default as schema } from '@household/test/schemas/calendar-entry-response';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

import { test, expect as domainExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { calendarEntryService, customerService, priceService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('GET /calendar/v1/entries/{calendarEntryId}', () => {
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;
  let blacklistedCustomerDocument: Customer.Document;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();
    blacklistedCustomerDocument = customerDataFactory.document();
    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomerDocument],
      jobs: [
        {
          prices: {
            listed: [
              {
                price: priceDocument,
              },
            ],
          },
        },
      ],
    });

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
      prices: {
        custom: [{}],
        listed: [
          {
            price: priceDocument,
          },
        ],
      },
      resolution: { 
        status: CalendarEntryResolutionStatus.Paid,
        delay: 30,
      },
    });
          
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetCalendarEntry }) => {
      const res = await requestGetCalendarEntry(calendarEntryDataFactory.id());
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
        test('should return forbidden', async ({ requestGetCalendarEntry }) => {
          const res = await requestGetCalendarEntry(calendarEntryDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should return calendar', () => {
          test('personal entry', async ({ requestGetCalendarEntry }) => {
            await calendarEntryService.saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestGetCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument));
            expect(res).toBeOkResponse();
            expect(res).toMatchSchema(schema);

            expect(res).toMatchCalendarEntryDocument(calendarPersonalEntryDocument);
          });

          test('issue entry', async ({ requestGetCalendarEntry }) => {                        
            await calendarEntryService.saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestGetCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument));
            expect(res).toBeOkResponse();
            expect(res).toMatchSchema(schema);

            expect(res).toMatchCalendarEntryDocument(calendarIssueEntryDocument);
          });

          test('work entry', async ({ requestGetCalendarEntry }) => {          
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            await customerService.saveCustomers(customerDocument, blacklistedCustomerDocument);
            await priceService.savePrice(priceDocument);
            const res = await requestGetCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument));
            expect(res).toBeOkResponse();
            expect(res).toMatchSchema(schema);

            expect(res).toMatchCalendarEntryDocument(calendarWorkEntryDocument);
          });
        });

        test.describe('should return error', () => {    
          test.describe('if calendarEntryId', () => {
            test('is not mongo id', async ({ requestGetCalendarEntry }) => {
              const res = await requestGetCalendarEntry(calendarEntryDataFactory.id('not-mongo-id'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'calendarEntryId');
            });

            test('does not belong to any calendar entry', async ({ requestGetCalendarEntry }) => {
              const res = await requestGetCalendarEntry(calendarEntryDataFactory.id());
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
