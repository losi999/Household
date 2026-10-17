import { responseList as schema } from '@household/shared/schemas/customer';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('GET /customer/v1/customers', () => {
  let customerDocument1: Documents.Customer;
  let customerDocument2: Documents.Customer;
  let blacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    blacklistedCustomer = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    customerDocument1 = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
      jobs: [
        {
          prices: [
            {
              price: priceDocument,
            },
          ],
        },
      ],
    });
    customerDocument2 = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
      jobs: [
        {
          prices: [
            {
              price: priceDocument,
            },
          ],
        },
      ],
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListCustomers }) => {
      const res = await requestListCustomers();
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
        test('should return forbidden', async ({ requestListCustomers }) => {
          const res = await requestListCustomers();
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of customers', async ({ requestListCustomers, savePrice, saveCustomers }) => {
          await saveCustomers(customerDocument1, customerDocument2, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestListCustomers();
          customerApiExpect(res).toBeOkResponse();
          customerApiExpect(res).toMatchSchema(schema);
          customerApiExpect(res).toContainMatchingCustomerDocument(customerDocument1);
          customerApiExpect(res).toContainMatchingCustomerDocument(customerDocument2);
        });
      }
    });
  });
});
