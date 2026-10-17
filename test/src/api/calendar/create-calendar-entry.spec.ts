import { entries, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { calendarApiTest, calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { DAY_END, DAY_START } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, priceDbTest, calendarEntryDbTest, customerDbTest);

test.describe('POST /calendar/v1/entries', () => {
  let request: Requests.CalendarEntry;
  let customerDocument: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();
            
    request = calendarEntryDataFactory.request.personal();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateCalendarEntry }) => {
      const res = await requestCreateCalendarEntry(request);
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
        test('should return forbidden', async ({ requestCreateCalendarEntry }) => {
          const res = await requestCreateCalendarEntry(request);
          calendarApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create calendar', () => {
          test.describe('personal entry', () => {
            test('with full body', async ({ requestCreateCalendarEntry, getCalendarEntryById }) => {
              request = calendarEntryDataFactory.request.personal();
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
  
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });

            test('without description', async ({ requestCreateCalendarEntry, getCalendarEntryById }) => {
              request = calendarEntryDataFactory.request.personal({
                description: undefined,
              });
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
  
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });
          });

          test.describe('issue entry', () => {
            test('with full body', async ({ requestCreateCalendarEntry, getCalendarEntryById }) => {
              request = calendarEntryDataFactory.request.issue();
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
  
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });

            test('without description', async ({ requestCreateCalendarEntry, getCalendarEntryById }) => {
              request = calendarEntryDataFactory.request.issue({
                description: undefined,
              });
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
  
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });
          });

          test.describe('work entry', () => {
            test('with full body', async ({ requestCreateCalendarEntry, savePrice, getCalendarEntryById, saveCustomer }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                },
                prices: [
                  {
                    priceId: getPriceId(priceDocument),
                  },
                ],
              });
            
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
            
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });

            test('without description', async ({ requestCreateCalendarEntry, savePrice, getCalendarEntryById, saveCustomer }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                  description: undefined,
                },
                prices: [
                  {
                    priceId: getPriceId(priceDocument),
                  },
                ],
              });
            
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
            
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });
            test('without additionalPrice', async ({ requestCreateCalendarEntry, savePrice, getCalendarEntryById, saveCustomer }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                  additionalPrice: undefined,
                },
                prices: [
                  {
                    priceId: getPriceId(priceDocument),
                  },
                ],
              });
            
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
            
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });
            test('without prices', async ({ requestCreateCalendarEntry, getCalendarEntryById, saveCustomer }) => {
              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                },
              });
            
              await saveCustomer(customerDocument);
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();

              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
            });

            test('for an archived customer', async ({ requestCreateCalendarEntry, saveCustomer, getCalendarEntryById, findCustomerById }) => {
              customerDocument = {
                ...customerDataFactory.document(),
                isArchived: true,
              };
              await saveCustomer(customerDocument);

              request = calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument),
                },
              });
            
              const res = await requestCreateCalendarEntry(request);
              calendarApiExpect(res).toBeCreatedResponse();
            
              const { calendarEntryId } = (await res.json()) as Api.Calendar.Entry.CalendarEntryId;
              calendarApiExpect(request).toHaveBeenSavedAsCalendarEntryDocument(await getCalendarEntryById(calendarEntryId));
              customerApiExpect(customerDocument).toHaveBeenActivated(await findCustomerById(getCustomerId(customerDocument)));
            });
          });
        });

        test.describe('should return error', () => {    
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if day', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  day: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'day');
            });

            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  day: <any>1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'day', 'string');
            });

            test('is not date format', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  day: 'not-date', 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongFormatValidationError('body', 'day', 'date');
            });
          }); 

          test.describe('if title', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  title: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'title');
            });

            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  title: <any>1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'title', 'string');
            });

            test('is too short', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  title: '', 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooShortValidationError('body', 'title', 1);
            });
          }); 

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  description: <any>1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  description: '', 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });
          
          test.describe('if entryType', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  entryType: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'entryType');
            });

            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  entryType: <any>1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'entryType', 'string');
            });

            test('is not a valid constant value', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  entryType: 'not-valid-const' as any, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveEnumValidationError('body', 'entryType');
            });
          });

          test.describe('if start', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  start: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'start');
            });

            test('is not integer', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  start: 1.1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'start', 'integer');
            });

            test('is too small', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  start: -1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooSmallValidationError('body', 'start', DAY_START);
            });

            test('is too large', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  start: 97, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooLargeValidationError('body', 'start', DAY_END);
            });
          });

          test.describe('if end', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  end: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'end');
            });

            test('is not integer', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  end: 1.1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'end', 'integer');
            });

            test('is too small', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  start: 20,
                  end: 10, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'end', 20);
            });

            test('is too large', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  end: 97, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooLargeValidationError('body', 'end', DAY_END);
            });
          }); 
          
          test.describe('if customerId', () => {
            test('is missing from body', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  customerId: undefined, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'customerId');
            });

            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  customerId: <any>1, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'customerId', 'string');
            });

            test('is not mongo id', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  customerId: 'not-mongo-id' as Api.Customer.Id, 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHavePatternValidationError('body', 'customerId');
            });

            test('does not belong to any customer', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  customerId: customerDataFactory.id(), 
                }, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveMessage('No customer found');
            });
          }); 

          test.describe('if prices', () => {
            test('is not array', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry({
                ...calendarEntryDataFactory.request.work(),
                prices: <any>{}, 
              });
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'prices', 'array');
            });

            test('has too few items', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry({
                ...calendarEntryDataFactory.request.work(),
                prices: [], 
              });
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveTooFewItemsValidationError('body', 'prices', 1);
            });
          });

          test.describe('if prices[0]', () => {
            test('is not object', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry({
                ...calendarEntryDataFactory.request.work(),
                prices: [1] as any, 
              });
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'prices/0', 'object');
            });

            test('has additional properties', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry({
                ...calendarEntryDataFactory.request.work(),
                prices: [
                  {
                    extra: 1, 
                  }, 
                ] as any, 
              });
              calendarApiExpect(res).toBeBadRequestResponse(); 
              calendarApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'prices/0', 'extra');
            });
          });

          test.describe('if prices[0].priceId', () => {
            test('is missing', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    priceId: undefined, 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'priceId');
            });

            test('is not string', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    priceId: <any>1, 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'priceId', 'string');
            });

            test('is not mongo id', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    priceId: <any>'not mongo id', 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHavePatternValidationError('body', 'priceId');
            });

            test('does not belong to any price', async ({ requestCreateCalendarEntry, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                body: {
                  customerId: getCustomerId(customerDocument), 
                },
                prices: [
                  {
                    priceId: priceDataFactory.id(), 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveMessage('Some of the prices are not found');
            });
          });

          test.describe('if prices[0].quantity', () => {
            test('is missing', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    quantity: undefined, 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'quantity');
            });

            test('is not number', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    quantity: <any>'1', 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestCreateCalendarEntry }) => {
              const res = await requestCreateCalendarEntry(calendarEntryDataFactory.request.work({
                prices: [
                  {
                    quantity: 0, 
                  }, 
                ], 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });
        });
      }
    });
  });
});
