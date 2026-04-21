import { entries, getCalendarEntryId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Account, Calendar, Category, Customer, Price } from '@household/shared/types/types';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { CalendarEntryResolutionStatus, SettingKey } from '@household/shared/enums';

import { expect as paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { test, expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { calendarEntryService, customerService, priceService, settingService, transactionService } from '@household/test/dependencies';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { default as moment } from 'moment-timezone';

const expect = mergeExpects(calendarApiExpect, apiExpect, paymentTransactionApiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('POST /calendar/v1/entries/{calendarEntryId}/resolution', () => {
  let request: Calendar.Entry.ResolutionRequest;
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
      prices: {
        custom: [{}],
        listed: [
          {
            price: priceDocument,
          },
        ],
      },
    });
            
    request = calendarEntryDataFactory.resolutionRequest();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestResolveCalendarWorkEntry }) => {
      const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestResolveCalendarWorkEntry }) => {
          const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update calendar work entry', () => {
          test('with transfer payment', async ({ requestResolveCalendarWorkEntry }) => {
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.PendingTransfer,
            });

            await customerService.saveCustomer(customerDocument);   
            await priceService.savePrice(priceDocument);
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeCreatedResponse();

            expect(calendarWorkEntryDocument).toHaveBeenResolved(await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument)), request);
          });

          test('with cash payment', async ({ requestResolveCalendarWorkEntry }) => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.Paid,
            });

            await customerService.saveCustomer(customerDocument);       
            await priceService.savePrice(priceDocument);
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeCreatedResponse();

            const updatedCalendarEntryDocument = await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument));

            const transactionId = updatedCalendarEntryDocument.resolution.status === CalendarEntryResolutionStatus.Paid ? getTransactionId(updatedCalendarEntryDocument.transaction) : undefined;

            expect(calendarWorkEntryDocument).toHaveBeenResolved(updatedCalendarEntryDocument, request, transactionId);
            
            const expectedIssuedAt = moment.tz(updatedCalendarEntryDocument.day, 'Europe/Budapest'); 
            expectedIssuedAt.set({
              hour: Math.floor(updatedCalendarEntryDocument.end / 4),
              minute: (updatedCalendarEntryDocument.end % 4) * 15,
            });

            const paymentRequest = paymentTransactionDataFactory.request({
              amount: (request as Calendar.Entry.PaidResolutionRequest).amount,
              issuedAt: expectedIssuedAt.toISOString(),
              description: calendarWorkEntryDocument.title,
              accountId: (await settingService.getSettingByKey<Account.Id>(SettingKey.HairdressingIncomeAccount)).value,
              categoryId: (await settingService.getSettingByKey<Category.Id>(SettingKey.HairdressingIncomeCategory)).value,
            });
            expect(paymentRequest).toHaveBeenSavedAsPaymentTransactionDocument(await transactionService.findTransactionById(transactionId));
          });

          test('with no show', async ({ requestResolveCalendarWorkEntry }) => {            
            request = calendarEntryDataFactory.resolutionRequest({
              status: CalendarEntryResolutionStatus.NoShow,
            });

            await customerService.saveCustomer(customerDocument);           
            await priceService.savePrice(priceDocument);    
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeCreatedResponse();

            expect(calendarWorkEntryDocument).toHaveBeenResolved(await calendarEntryService.getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument)), request);
          });
        });

        test.describe('should return error', () => {    
          test('if work entry is already resolved', async ({ requestResolveCalendarWorkEntry }) => {              
            calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                status: CalendarEntryResolutionStatus.Paid,
              },
            });
          
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), request);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Calendar entry is already resolved');
          });

          test('if entry is personal', async ({ requestResolveCalendarWorkEntry }) => {              
            await calendarEntryService.saveCalendarEntry(calendarPersonalEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarPersonalEntryDocument), request);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Calendar entry must be of "work" type');
          });

          test('if entry is issue', async ({ requestResolveCalendarWorkEntry }) => {              
            await calendarEntryService.saveCalendarEntry(calendarIssueEntryDocument);
            const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarIssueEntryDocument), request);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Calendar entry must be of "work" type');
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), {
                ...request,
                extraProperty: 'extra',
              } as any);
            
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          
          test.describe('if status', () => {
            test('is missing from body', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'status');
            });

            test('is not string', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'status', 'string');
            });

            test('is not a valid value', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                status: 'not-valid-enum' as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveConstantValueValidationError('body', 'status');
            });
          });

          test.describe('if amount', () => {
            test('is missing from body', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                amount: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                amount: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'number');
            });
          });

          test.describe('if delay', () => {
            test('is not integer', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                delay: <any>'1', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'delay', 'integer');
            });

            test('is too small', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(getCalendarEntryId(calendarWorkEntryDocument), calendarEntryDataFactory.resolutionRequest({
                delay: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'delay', 0);
            });
          });

          test.describe('if calendarEntryId', () => {
            test('is not mongo id', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id('not-mongo-id'), calendarEntryDataFactory.resolutionRequest());
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'calendarEntryId');
            });

            test('does not belong to any calendar entry', async ({ requestResolveCalendarWorkEntry }) => {
              const res = await requestResolveCalendarWorkEntry(calendarEntryDataFactory.id(), calendarEntryDataFactory.resolutionRequest());
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No calendar entry found');
            });
          }); 
        });
      }
    });
  });
});
