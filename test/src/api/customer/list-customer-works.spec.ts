import { responseLeanList as schema } from '@household/shared/schemas/calendar-entry';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeTests } from '@playwright/test';
import { calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, calendarEntryDbTest, customerDbTest);

test.describe('GET /customer/v1/customers/{customerId}/works', () => {
  let customerDocument: Documents.Customer;
  let workEntryDocument: Documents.CalendarEntry;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();

    workEntryDocument = calendarEntryDataFactory.document.work({
      customer: customerDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListCustomerWorks }) => {
      const res = await requestListCustomerWorks(customerDataFactory.id());
      customerApiExpect(res).toBeUnauthorizedResponse();
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
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get customer works', async ({ requestListCustomerWorks, saveCalendarEntry, saveCustomer }) => {
          await saveCustomer(customerDocument);
          await saveCalendarEntry(workEntryDocument);
          const res = await requestListCustomerWorks(getCustomerId(customerDocument));
          customerApiExpect(res).toBeOkResponse();
          customerApiExpect(res).toMatchSchema(schema);
          calendarApiExpect(res).toContainMatchingCalendarEntryBaseDocument(workEntryDocument);
        });

        test.describe('should return error if customerId', () => {
          test('is not mongo id', async ({ requestListCustomerWorks }) => {
            const res = await requestListCustomerWorks(customerDataFactory.id('not-valid'));
            customerApiExpect(res).toBeBadRequestResponse();
            customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
          });

          test('does not belong to any customer', async ({ requestListCustomerWorks }) => {
            const res = await requestListCustomerWorks(customerDataFactory.id());
            customerApiExpect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
