import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(customerApiTest, customerDbTest, customerDbTest, calendarEntryDbTest);

test.describe('DELETE /customer/v1/customers/{customerId}', () => {
  let customerDocument: Documents.Customer;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCustomer }) => {
      const res = await requestDeleteCustomer(customerDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteCustomer }) => {
          const res = await requestDeleteCustomer(customerDataFactory.id());
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete customer', async ({ requestDeleteCustomer, saveCustomer, findCustomerById }) => {
          await saveCustomer(customerDocument);
          const res = await requestDeleteCustomer(getCustomerId(customerDocument));
          customerApiExpect(res).toBeNoContentResponse();

          customerApiExpect(await findCustomerById(getCustomerId(customerDocument))).toHaveBeenDeletedFromDatabase();
        });

        test('should delete customer from blacklist', async ({ requestDeleteCustomer, saveCustomers, findCustomerById }) => {
          const customerWithBlacklist = customerDataFactory.document({
            blacklistedCustomers: [customerDocument],
          });
          await saveCustomers(customerDocument, customerWithBlacklist);
          const res = await requestDeleteCustomer(getCustomerId(customerDocument));
          customerApiExpect(res).toBeNoContentResponse();

          customerApiExpect(await findCustomerById(getCustomerId(customerDocument))).toHaveBeenDeletedFromDatabase();
          customerApiExpect(customerDocument).toHaveBeenRemovedFromBlacklist(customerWithBlacklist, await findCustomerById(getCustomerId(customerWithBlacklist)));
        });

        test.describe('should archive customer', () => {
          test('if there is a calendar entry', async ({ requestDeleteCustomer, saveCustomer, findCustomerById, saveCalendarEntry }) => {
            const customerDocument = customerDataFactory.document();
            
            const calendarEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
            });
            
            await saveCustomer(customerDocument);
            await saveCalendarEntry(calendarEntryDocument);

            const res = await requestDeleteCustomer(getCustomerId(customerDocument));
            customerApiExpect(res).toBeNoContentResponse();

            customerApiExpect(customerDocument).toHaveBeenArchived(await findCustomerById(getCustomerId(customerDocument)));
          });
        });

        test.describe('should return error', () => {
          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestDeleteCustomer }) => {
              const res = await requestDeleteCustomer(customerDataFactory.id('not-valid'));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });
          });
        });
      }
    });
  });
});
