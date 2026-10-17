import { entries, getCalendarEntryId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Api } from '@household/shared/types/api';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { CalendarEntryResolutionStatus, SettingKey } from '@household/shared/enums';

import { paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { calendarApiTest, calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeTests } from '@playwright/test';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { default as moment } from 'moment-timezone';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { settingDbTest } from '@household/test/fixtures/setting-db.fixture';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(calendarApiTest, transactionDbTest, settingDbTest, priceDbTest, calendarEntryDbTest, customerDbTest);

test.describe('POST /calendar/v1/entries/{calendarEntryId}/resolution', () => {
  let request: Requests.CalendarEntryResolution;
  let calendarPersonalEntryDocument: Documents.CalendarEntry;
  let calendarWorkEntryDocument: Documents.CalendarEntry;
  let calendarIssueEntryDocument: Documents.CalendarEntry;
  let customerDocument: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    calendarPersonalEntryDocument = calendarEntryDataFactory.document.personal();

    calendarIssueEntryDocument = calendarEntryDataFactory.document.issue();

    calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
      prices: [
        {
          price: priceDocument,
        },
      ],
    });
            
    request = calendarEntryDataFactory.resolutionRequest();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestResolveCalendarWorkEntry }) => {
      const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestResolveCalendarWorkEntry }) => {
          const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request);
          calendarApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update calendar work entry', () => {
          test('with transfer payment', async ({ requestResolveCalendarWorkEntry, savePrice, saveCalendarEntry, getCalendarEntryById, saveCustomer }) => {
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.PendingTransfer,
            });

            await saveCustomer(customerDocument);   
            await savePrice(priceDocument);
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            calendarApiExpect(res).toBeCreatedResponse();

            calendarApiExpect(calendarWorkEntryDocument).toHaveBeenResolved(await getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument)), request);
          });

          test('with cash payment', async ({ requestResolveCalendarWorkEntry, findTransactionById, savePrice, saveCalendarEntry, getCalendarEntryById, saveCustomer, getSettingByKey }) => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.Paid,
            });

            await saveCustomer(customerDocument);       
            await savePrice(priceDocument);
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            calendarApiExpect(res).toBeCreatedResponse();

            const updatedCalendarEntryDocument = await getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument));

            const transactionId = updatedCalendarEntryDocument.resolution.status === CalendarEntryResolutionStatus.Paid ? getTransactionId(updatedCalendarEntryDocument.transaction) : undefined;

            calendarApiExpect(calendarWorkEntryDocument).toHaveBeenResolved(updatedCalendarEntryDocument, request, transactionId);
            
            const expectedIssuedAt = moment.tz(updatedCalendarEntryDocument.day, 'Europe/Budapest'); 
            expectedIssuedAt.set({
              hour: Math.floor(updatedCalendarEntryDocument.end / 4),
              minute: (updatedCalendarEntryDocument.end % 4) * 15,
            });

            const paymentRequest = paymentTransactionDataFactory.request({
              amount: (request as Requests.CalendarEntryResolutionPaid).amount,
              issuedAt: expectedIssuedAt.toISOString(),
              description: calendarWorkEntryDocument.title,
              accountId: (await getSettingByKey<Api.Account.Id>(SettingKey.HairdressingIncomeAccount)).value,
              categoryId: (await getSettingByKey<Api.Category.Id>(SettingKey.HairdressingIncomeCategory)).value,
            });
            paymentTransactionApiExpect(paymentRequest).toHaveBeenSavedAsPaymentTransactionDocument(await findTransactionById(transactionId));
          });

          test('with no show', async ({ requestResolveCalendarWorkEntry, savePrice, saveCalendarEntry, getCalendarEntryById, saveCustomer }) => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.NoShow,
            });

            await saveCustomer(customerDocument);           
            await savePrice(priceDocument);    
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            calendarApiExpect(res).toBeCreatedResponse();

            calendarApiExpect(calendarWorkEntryDocument).toHaveBeenResolved(await getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument)), request);
          });
        });

        test.describe('should return error', () => {    
          test('if work entry is already resolved', async ({ requestResolveCalendarWorkEntry, saveCalendarEntry }) => {              
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });
          
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            calendarApiExpect(res).toBeBadRequestResponse();
            calendarApiExpect(res).toHaveMessage('Calendar entry is already resolved');
          });

          test('if entry is personal', async ({ requestResolveCalendarWorkEntry, saveCalendarEntry }) => {              
            await saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarPersonalEntryDocument), request);
            calendarApiExpect(res).toBeBadRequestResponse();
            calendarApiExpect(res).toHaveMessage('Calendar entry must be of "work" type');
          });

          test('if entry is issue', async ({ requestResolveCalendarWorkEntry, saveCalendarEntry }) => {              
            await saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarIssueEntryDocument), request);
            calendarApiExpect(res).toBeBadRequestResponse();
            calendarApiExpect(res).toHaveMessage('Calendar entry must be of "work" type');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...request,
                extraProperty: 'extra',
              } as any);
            
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if status', () => {
            test('is missing from body', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: undefined, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'status');
            });

            test('is not string', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: <any>1, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'status', 'string');
            });

            test('is not a valid value', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: 'not-valid-enum' as any, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveEnumValidationError('body', 'status');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                amount: undefined, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                amount: <any>'1', 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });
          });

          test.describe('if delay', () => {
            test('is not integer', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                delay: <any>'1', 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveWrongTypeValidationError('body', 'delay', 'integer');
            });

            test('is too small', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                delay: 0, 
              }));
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'delay', 0);
            });
          });

          test.describe('if calendarEntryId', () => {
            test('is not mongo id', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id('not-mongo-id'), calendarEntryDataFactory.resolutionRequest());
              calendarApiExpect(res).toBeBadRequestResponse();
              calendarApiExpect(res).toHavePatternValidationError('pathParameters', 'calendarEntryId');
            });

            test('does not belong to any calendar entry', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), calendarEntryDataFactory.resolutionRequest());
              calendarApiExpect(res).toBeNotFoundResponse();
              calendarApiExpect(res).toHaveMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
