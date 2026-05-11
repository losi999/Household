import { default as schema } from '@household/test/schemas/customer-response-list';
import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('GET /customer/v1/customers', () => {
  let customerDocument1: Customer.Document;
  let customerDocument2: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

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
        test('should return forbidden', async ({ requestListCustomers }) => {
          const res = await requestListCustomers();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of customers', async ({ requestListCustomers, savePrice, saveCustomers }) => {
          await saveCustomers(customerDocument1, customerDocument2, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestListCustomers();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toContainMatchingCustomerDocument(customerDocument1);
          expect(res).toContainMatchingCustomerDocument(customerDocument2);
        });
      }
    });
  });
});
