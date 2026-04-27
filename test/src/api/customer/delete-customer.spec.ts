import { entries, getCustomerId } from '@household/shared/common/utils';
import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';

import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser') ;

const test = mergeTests(customerApiTest, customerDbTest, customerDbTest, calendarEntryDbTest);

test.describe('DELETE /customer/v1/customers/{customerId}', () => {
  let customerDocument: Customer.Document;

  test.beforeEach(async () => {
    customerDocument = customerDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCustomer }) => {
      const res = await requestDeleteCustomer(customerDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteCustomer }) => {
          const res = await requestDeleteCustomer(customerDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete customer', async ({ requestDeleteCustomer, saveCustomer, findCustomerById }) => {
          await saveCustomer(customerDocument);
          const res = await requestDeleteCustomer(getCustomerId(customerDocument));
          expect(res).toBeNoContentResponse();

          expect(await findCustomerById(getCustomerId(customerDocument))).toHaveBeenDeletedFromDatabase();
        });

        test('should delete customer from blacklist', async ({ requestDeleteCustomer, saveCustomers, findCustomerById }) => {
          const customerWithBlacklist = customerDataFactory.document({
            blacklistedCustomers: [customerDocument],
          });
          await saveCustomers(customerDocument, customerWithBlacklist);
          const res = await requestDeleteCustomer(getCustomerId(customerDocument));
          expect(res).toBeNoContentResponse();

          expect(await findCustomerById(getCustomerId(customerDocument))).toHaveBeenDeletedFromDatabase();
          expect(customerDocument).toHaveBeenRemovedFromBlacklist(customerWithBlacklist, await findCustomerById(getCustomerId(customerWithBlacklist)));
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
            expect(res).toBeNoContentResponse();

            expect(customerDocument).toHaveBeenArchived(await findCustomerById(getCustomerId(customerDocument)));
          });
        });

        test.describe('should return error', () => {
          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestDeleteCustomer }) => {
              const res = await requestDeleteCustomer(customerDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });
          });
        });
      }
    });
  });
});
