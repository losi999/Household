import { default as schema } from '@household/test/schemas/calendar-entry-response-base-list';
import { Calendar, Customer } from '@household/shared/types/types';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(customerApiExpect, calendarApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, calendarEntryDbTest, customerDbTest);

test.describe('GET /customer/v1/customers/{customerId}/works', () => {
  let customerDocument: Customer.Document;
  let workEntryDocument: Calendar.Entry.Document;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();

    workEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListCustomerWorks }) => {
      const res = await requestListCustomerWorks(customerDataFactory.id());
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
        test('should return forbidden', async ({ requestListCustomerWorks }) => {
          const res = await requestListCustomerWorks(customerDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get customer works', async ({ requestListCustomerWorks, saveCalendarEntry, saveCustomer }) => {
          await saveCustomer(customerDocument);
          await saveCalendarEntry(workEntryDocument);
          const res = await requestListCustomerWorks(getCustomerId(customerDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toContainMatchingCalendarEntryBaseDocument(workEntryDocument);
        });

        test.describe('should return error if customerId', () => {
          test('is not mongo id', async ({ requestListCustomerWorks }) => {
            const res = await requestListCustomerWorks(customerDataFactory.id('not-valid'));
            expect(res).toBeBadRequestResponse();
            expect(res).toHavePatternValidationError('pathParameters', 'customerId');
          });

          test('does not belong to any customer', async ({ requestListCustomerWorks }) => {
            const res = await requestListCustomerWorks(customerDataFactory.id());
            expect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
