import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('PUT customer/v1/customers/blacklist', () => {
  let customerDocumentA: Documents.Customer;
  let customerDocumentB: Documents.Customer;
  let alreadyBlacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();

    alreadyBlacklistedCustomer = customerDataFactory.document();

    customerDocumentA = customerDataFactory.document({
      blacklistedCustomers: [alreadyBlacklistedCustomer],
    });
    customerDocumentB = customerDataFactory.document({
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
    test('should return unauthorized', async ({ requestAddCustomerToBlacklist }) => {
      const res = await requestAddCustomerToBlacklist([
        customerDataFactory.id(),
        customerDataFactory.id(), 
      ]);
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
        test('should return forbidden', async ({ requestAddCustomerToBlacklist }) => {
          const res = await requestAddCustomerToBlacklist([
            customerDataFactory.id(),
            customerDataFactory.id(), 
          ]);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should add customer to blacklist', async ({ requestAddCustomerToBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestAddCustomerToBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(customerDocumentA).toHaveBeenAddedToBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          customerApiExpect(customerDocumentB).toHaveBeenAddedToBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test('should handle if customers are already added to blacklist', async ({ requestAddCustomerToBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          customerDocumentA = customerDataFactory.document({
            blacklistedCustomers: [customerDocumentB],
          });

          await saveCustomers(customerDocumentA, customerDocumentB);
          await savePrice(priceDocument);
          const res = await requestAddCustomerToBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(customerDocumentA).toHaveBeenAddedToBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          customerApiExpect(customerDocumentB).toHaveBeenAddedToBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not array', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist(<any>{});
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('is has to few items', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([customerDataFactory.id()]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooFewItemsValidationError('body', 'data', 2);
            });

            test('has too many items', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id(),
                customerDataFactory.id(), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooManyItemsValidationError('body', 'data', 2);
            });

            test('items are the same', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentA), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Customer cannot be blacklisted with itself');
            });
          });

          test.describe('if body[0]', () => {
            test('is not mongo id', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id('not-mongo-id'),
                customerDataFactory.id(), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('body', 'data/0');
            });

            test('does not belong to any customer', async ({ requestAddCustomerToBlacklist, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocumentB);
              await savePrice(priceDocument);
              const res = await requestAddCustomerToBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              customerApiExpect(res).toBeNotFoundResponse();
              customerApiExpect(res).toHaveMessage('No customer found');
            });
          });

          test.describe('if body[1]', () => {
            test('is not mongo id', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id('not-mongo-id'), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('body', 'data/1');
            });

            test('does not belong to any customer', async ({ requestAddCustomerToBlacklist, saveCustomers }) => {
              await saveCustomers(customerDocumentA, alreadyBlacklistedCustomer);
              const res = await requestAddCustomerToBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              customerApiExpect(res).toBeNotFoundResponse();
              customerApiExpect(res).toHaveMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
