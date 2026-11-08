import { response as schema } from '@household/shared/schemas/customer';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('GET /customer/v1/customers/{customerId}', () => {
  let customerDocument: Documents.Customer;
  let blacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    blacklistedCustomer = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    customerDocument = customerDataFactory.document({
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
    test('should return unauthorized', async ({ requestGetCustomer }) => {
      const res = await requestGetCustomer(customerDataFactory.id());
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
        test('should return forbidden', async ({ requestGetCustomer }) => {
          const res = await requestGetCustomer(customerDataFactory.id());
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get customer by id', async ({ requestGetCustomer, savePrice, saveCustomers }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestGetCustomer(getCustomerId(customerDocument));
          customerApiExpect(res).toBeOkResponse();
          customerApiExpect(res).toMatchSchema(schema);
          customerApiExpect(res).toMatchCustomerDocument(customerDocument);
        });

        test.describe('should return error if customerId', () => {
          test('is not mongo id', async ({ requestGetCustomer }) => {
            const res = await requestGetCustomer(customerDataFactory.id('not-valid'));
            customerApiExpect(res).toBeBadRequestResponse();
            customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
          });

          test('does not belong to any customer', async ({ requestGetCustomer }) => {
            const res = await requestGetCustomer(customerDataFactory.id());
            customerApiExpect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
