import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarDayDataFactory, calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { default as schema } from '@household/test/schemas/calendar-day-response-list';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';

import { test as calendarApiTest, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as calendarDayDbTest } from '@household/test/fixtures/calendar-day-db.fixture';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, priceDbTest, calendarDayDbTest, calendarEntryDbTest, customerDbTest);

test.describe('GET /calendar/v1/days', () => {
  let customerDocument: Customer.Document;
  let blacklistedCustomerDocument: Customer.Document;
  let priceDocument: Price.Document;
  let day: string;
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarDayDocument: Calendar.Day.Document;

  const createEntries = () => {
    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal({
      day,
    });

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue({
      day,
    });

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      body: {
        day,
      },
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
  };

  test.beforeEach(async () => {
    day = calendarDayDataFactory.futureDay();
              
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
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListCalendarDays }) => {
      const res = await requestListCalendarDays({
        dateFrom: calendarDayDataFactory.pastDay(),
        dateTo: calendarDayDataFactory.futureDay(), 
      });
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
        test('should return forbidden', async ({ requestListCalendarDays }) => {
          const res = await requestListCalendarDays({
            dateFrom: calendarDayDataFactory.pastDay(),
            dateTo: calendarDayDataFactory.futureDay(), 
          });
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe.serial('should return', () => {
          test.describe('workday', () => {
            test.beforeEach(() => {
              day = calendarDayDataFactory.futureWorkday();

              createEntries();
            });

            test.describe('without custom limits', () => {
              test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);

                await saveCalendarEntry(calendarPersonalEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument);
              });

              test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);

                await saveCalendarEntry(calendarIssueEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument);
              });

              test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarEntry, saveCustomers }) => {
                await clearCalendarDay(day);

                await saveCustomers(customerDocument, blacklistedCustomerDocument);
                await savePrice(priceDocument);
                await saveCalendarEntry(calendarWorkEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument);
              });
            });

            test.describe('with custom limits', () => {
              test.beforeEach(async () => {
                calendarDayDocument = calendarDayDataFactory.document.work({
                  day,
                });
              });

              test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);

                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarPersonalEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument, calendarDayDocument);
              });

              test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);

                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarIssueEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument, calendarDayDocument);
              });

              test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarDay, saveCalendarEntry, saveCustomers }) => {
                await clearCalendarDay(day);

                await saveCustomers(customerDocument, blacklistedCustomerDocument);
                await savePrice(priceDocument);
                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarWorkEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument, calendarDayDocument);
              });
            });
          });

          test.describe('weekend', () => {
            test.beforeEach(async () => {
              day = calendarDayDataFactory.futureWeekend();

              createEntries();
            });

            test.describe('without custom limits', () => {
              test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);
                
                await saveCalendarEntry(calendarPersonalEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument);
              });

              test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);
                
                await saveCalendarEntry(calendarIssueEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);  
                expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument);
              });

              test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarEntry, saveCustomers }) => {
                await clearCalendarDay(day);
                
                await saveCustomers(customerDocument, blacklistedCustomerDocument);
                await savePrice(priceDocument);
                await saveCalendarEntry(calendarWorkEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument);
              });
            });

            test.describe('with custom limits', () => {
              test.beforeEach(async () => {
                calendarDayDocument = calendarDayDataFactory.document.work({
                  day,
                });
              });

              test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);
                
                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarPersonalEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument, calendarDayDocument);
              });

              test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
                await clearCalendarDay(day);
                
                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarIssueEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument, calendarDayDocument);
              });

              test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarDay, saveCalendarEntry, saveCustomers }) => {
                await clearCalendarDay(day);
                
                await saveCustomers(customerDocument, blacklistedCustomerDocument);
                await savePrice(priceDocument);
                await saveCalendarDay(calendarDayDocument);
                await saveCalendarEntry(calendarWorkEntryDocument);
                const res = await requestListCalendarDays({
                  dateFrom: day,
                  dateTo: day, 
                });
                expect(res).toBeOkResponse();
                expect(res).toMatchSchema(schema);
                expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument, calendarDayDocument);
              });
            });
          });

          test.describe('holiday', () => {
            test.beforeEach(async () => {
              calendarDayDocument = calendarDayDataFactory.document.holiday({
                day,
              });

              createEntries();
            });
            test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
              await clearCalendarDay(day);
                
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarPersonalEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument, calendarDayDocument);
            });

            test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
              await clearCalendarDay(day);
                
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarIssueEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument, calendarDayDocument);
            });

            test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarDay, saveCalendarEntry, saveCustomers }) => {
              await clearCalendarDay(day);
                
              await saveCustomers(customerDocument, blacklistedCustomerDocument);
              await savePrice(priceDocument);
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarWorkEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument, calendarDayDocument);
            });
          });

          test.describe('vacation', () => {
            test.beforeEach(async () => {
              calendarDayDocument = calendarDayDataFactory.document.vacation({
                day,
              });

              createEntries();
            });

            test('with a personal entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
              await clearCalendarDay(day);
                
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarPersonalEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarPersonalEntryDocument, calendarDayDocument);
            });

            test('with an issue entry', async ({ requestListCalendarDays, clearCalendarDay, saveCalendarDay, saveCalendarEntry }) => {
              await clearCalendarDay(day);
                
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarIssueEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarIssueEntryDocument, calendarDayDocument);
            });

            test('with a work entry', async ({ requestListCalendarDays, savePrice, clearCalendarDay, saveCalendarDay, saveCalendarEntry, saveCustomers }) => {
              await clearCalendarDay(day);
                
              await saveCustomers(customerDocument, blacklistedCustomerDocument);
              await savePrice(priceDocument);
              await saveCalendarDay(calendarDayDocument);
              await saveCalendarEntry(calendarWorkEntryDocument);
              const res = await requestListCalendarDays({
                dateFrom: day,
                dateTo: day, 
              });
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              expect(res).toContainMatchingCalendarDayDocument(day, calendarWorkEntryDocument, calendarDayDocument);
            });
          });
        });

        test.describe('should return error', () => {    
          test.describe('if dateFrom', () => {
            test('is missing', async ({ requestListCalendarDays }) => {
              const res = await requestListCalendarDays({
                dateTo: calendarDayDataFactory.futureDay(), 
              } as Calendar.DateRange);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('queryStringParameters', 'dateFrom');
            });

            test('is not a date', async ({ requestListCalendarDays }) => {
              const res = await requestListCalendarDays({
                dateFrom: 'not a date',
                dateTo: calendarDayDataFactory.futureDay(), 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('queryStringParameters', 'dateFrom', 'date');
            });
          }); 

          test.describe('if dateTo', () => {
            test('is missing', async ({ requestListCalendarDays }) => {
              const res = await requestListCalendarDays({
                dateFrom: calendarDayDataFactory.pastDay(), 
              } as Calendar.DateRange);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('queryStringParameters', 'dateTo');
            });

            test('is not a date', async ({ requestListCalendarDays }) => {
              const res = await requestListCalendarDays({
                dateFrom: calendarDayDataFactory.pastDay(),
                dateTo: 'not a date', 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('queryStringParameters', 'dateTo', 'date');
            });

            test('is earlier than dateFrom', async ({ requestListCalendarDays }) => {
              const res = await requestListCalendarDays({
                dateFrom: calendarDayDataFactory.futureDay(),
                dateTo: calendarDayDataFactory.pastDay(), 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('queryStringParameters', 'dateTo', false);
            });
          }); 
        });
      }
    });
  });
});
