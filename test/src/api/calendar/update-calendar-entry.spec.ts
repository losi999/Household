import { entries, getCalendarEntryId, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Calendar, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { test as calendarApiTest, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, priceDbTest, calendarEntryDbTest, customerDbTest);

test.describe('PUT /calendar/v1/entries/{calendarEntryId}', () => {
  let request: Calendar.Entry.Request;
  let calendarPersonalEntryDocument: Calendar.Entry.Document;
  let calendarWorkEntryDocument: Calendar.Entry.Document;
  let calendarIssueEntryDocument: Calendar.Entry.Document;
  let customerDocument: Customer.Document;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
            
    request = calendarEntryDataFactory.request.personal();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCalendarEntry }) => {
      const res = await requestUpdateCalendarEntry(calendarEntryDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateCalendarEntry }) => {
          const res = await requestUpdateCalendarEntry(calendarEntryDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update calendar', () => {
          test('personal entry', async ({ requestUpdateCalendarEntry, saveCalendarEntry, getCalendarEntryById }) => {
            request = calendarEntryDataFactory.request.personal();

            await saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument), request);
            expect(res).toBeCreatedResponse();

            const { calendarEntryId } = (await res.json()) as Calendar.Entry.CalendarEntryId;
            expect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
          });

          test('issue entry', async ({ requestUpdateCalendarEntry, saveCalendarEntry, getCalendarEntryById }) => {            
            request = calendarEntryDataFactory.request.issue();
            
            await saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument), request);
            expect(res).toBeCreatedResponse();

            const { calendarEntryId } = (await res.json()) as Calendar.Entry.CalendarEntryId;
            expect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
          });

          test('work entry without prices', async ({ requestUpdateCalendarEntry, saveCalendarEntry, getCalendarEntryById, saveCustomer }) => {          
            request = calendarEntryDataFactory.request.work({
              body: {
                customerId: getCustomerId(customerDocument),
              },
            });
            
            await saveCalendarEntry(calendarWorkEntryDocument);
            await saveCustomer(customerDocument);
            const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeCreatedResponse();

            const { calendarEntryId } = (await res.json()) as Calendar.Entry.CalendarEntryId; 
            expect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
          });

          test('work entry with prices', async ({ requestUpdateCalendarEntry, savePrice, saveCalendarEntry, getCalendarEntryById, saveCustomer }) => {     
            request = calendarEntryDataFactory.request.work({
              body: {
                customerId: getCustomerId(customerDocument),
              },
              prices: {
                listed: [
                  {
                    priceId: getPriceId(priceDocument),
                  },
                ],
                custom: [{}],
              },
            });
            
            await saveCalendarEntry(calendarWorkEntryDocument);
            await saveCustomer(customerDocument);
            await savePrice(priceDocument);
            const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeCreatedResponse();

            const { calendarEntryId } = (await res.json()) as Calendar.Entry.CalendarEntryId; 
            expect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
          });
        });

        test.describe('should return error', () => {    
          test.describe('if trying to update entry type', () => {
            test('from issue to personal', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.personal();
              
              await saveCalendarEntry(calendarIssueEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });

            test('from issue to work', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                },
              });
              
              await saveCalendarEntry(calendarIssueEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarIssueEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });

            test('from personal to issue', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.issue();
              
              await saveCalendarEntry(calendarPersonalEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });

            test('from personal to work', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                },
              });
              
              await saveCalendarEntry(calendarPersonalEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarPersonalEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });

            test('from work to issue', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.issue();
              
              await saveCalendarEntry(calendarWorkEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });

            test('from work to personal', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              request = calendarEntryDataFactory.request.personal();
              
              await saveCalendarEntry(calendarWorkEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Entry type cannot be changed');
            });
          });

          test('if work entry is already resolved', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });  
            request = calendarEntryDataFactory.request.work({
              body: {
                customerId: getCustomerId(customerDocument),
              },
            });
              
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Calendar entry is already resolved');
          });

          test.describe('if day', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  day: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'day');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  day: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'day', 'string');
            });

            test('is not date format', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  day: 'not-date', 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'day', 'date');
            });
          }); 

          test.describe('if title', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  title: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'title');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  title: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'title', 'string');
            });

            test('is too short', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  title: '', 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'title', 1);
            });
          }); 

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  description: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  description: '', 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });
          
          test.describe('if entryType', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  entryType: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'entryType');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  entryType: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'entryType', 'string');
            });

            test('is not a valid constant value', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  entryType: 'not-valid-const' as any, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveConstantValueValidationError('body', 'entryType');
            });
          });

          test.describe('if start', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  start: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'start');
            });

            test('is not integer', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  start: 1.1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'start', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  start: -1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooSmallValidationError('body', 'start', 0);
            });

            test('is too large', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  start: 97, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'start', 96);
            });
          });

          test.describe('if end', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  end: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'end');
            });

            test('is not integer', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  end: 1.1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'end', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  start: 20,
                  end: 10, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'end', 20);
            });

            test('is too large', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  end: 97, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'end', 96);
            });
          }); 
          
          test.describe('if customerId', () => {
            test('is missing from body', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  customerId: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'customerId');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  customerId: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'customerId', 'string');
            });

            test('is not mongo id', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  customerId: customerDataFactory.id('not-mongo-id'), 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'customerId');
            });

            test('does not belong to any customer', async ({ requestUpdateCalendarEntry, saveCalendarEntry }) => {
              await saveCalendarEntry(calendarWorkEntryDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  customerId: customerDataFactory.id(), 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No customer found');
            });
          }); 

          test.describe('if prices', () => {
            test('is not array', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...calendarEntryDataFactory.request.work(),
                prices: <any>{}, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'prices', 'array');
            });

            test('has too few items', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...calendarEntryDataFactory.request.work(),
                prices: [], 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'prices', 1);
            });
          });

          test.describe('if prices[0]', () => {
            test('is not object', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...calendarEntryDataFactory.request.work(),
                prices: [1] as any, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'prices/0', 'object');
            });

            test('has additional properties', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...calendarEntryDataFactory.request.work(),
                prices: [
                  {
                    extra: 1, 
                  }, 
                ] as any, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'prices/0', 'extra');
            });
          });

          test.describe('if prices[0].priceId', () => {
            test('is missing', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      priceId: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'priceId');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      priceId: <any>1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'priceId', 'string');
            });

            test('is not mongo id', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      priceId: priceDataFactory.id('not mongo id'), 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'priceId');
            });

            test('does not belong to any price', async ({ requestUpdateCalendarEntry, savePrice, saveCalendarEntry, saveCustomer }) => {
              await saveCalendarEntry(calendarWorkEntryDocument);
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument), 
                },
                prices: {
                  listed: [
                    {
                      priceId: priceDataFactory.id(), 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the prices are not found');
            });
          });

          test.describe('if prices[0].quantity', () => {
            test('is missing', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      quantity: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'quantity');
            });

            test('is not integer', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      quantity: <any>1.1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'integer');
            });

            test('is too small', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  listed: [
                    {
                      quantity: 0, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if prices[0].name', () => {
            test('is missing', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  custom: [
                    {
                      name: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  custom: [
                    {
                      name: <any>1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  custom: [
                    {
                      name: '', 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });
          });

          test.describe('if prices[0].amount', () => {
            test('is missing', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  custom: [
                    {
                      amount: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.request.work({
                prices: {
                  custom: [
                    {
                      amount: <any>1.1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });
          });

          test.describe('if calendarEntryId', () => {
            test('is not mongo id', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(calendarEntryDataFactory.id('not-mongo-id'), calendarEntryDataFactory.request.work());
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'calendarEntryId');
            });

            test('does not belong to any calendar entry', async ({ requestUpdateCalendarEntry }) => {
              const res = await requestUpdateCalendarEntry(calendarEntryDataFactory.id(), calendarEntryDataFactory.request.work({
                body: {
                  customerId: customerDataFactory.id(), 
                }, 
              }));
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
