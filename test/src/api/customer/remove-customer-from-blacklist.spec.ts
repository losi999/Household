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

test.describe('DELETE customer/v1/customers/blacklist', () => {
  let customerDocumentA: Documents.Customer;
  let customerDocumentB: Documents.Customer;
  let alreadyBlacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();

    alreadyBlacklistedCustomer = customerDataFactory.document();
    customerDocumentB = customerDataFactory.document({
      blacklistedCustomers: [alreadyBlacklistedCustomer],
    });

    customerDocumentA = customerDataFactory.document({
      blacklistedCustomers: [customerDocumentB],
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
    test('should return unauthorized', async ({ requestRemoveCustomerFromBlacklist }) => {
      const res = await requestRemoveCustomerFromBlacklist([
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
        test('should return forbidden', async ({ requestRemoveCustomerFromBlacklist }) => {
          const res = await requestRemoveCustomerFromBlacklist([
            customerDataFactory.id(),
            customerDataFactory.id(), 
          ]);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove customer from blacklist', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestRemoveCustomerFromBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(customerDocumentA).toHaveBeenRemovedFromBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          customerApiExpect(customerDocumentB).toHaveBeenRemovedFromBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test('should handle if customers were already removed to blacklist', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestRemoveCustomerFromBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(customerDocumentA).toHaveBeenRemovedFromBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          customerApiExpect(customerDocumentB).toHaveBeenRemovedFromBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not array', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist(<any>{});
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('is has to few items', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([customerDataFactory.id()]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooFewItemsValidationError('body', 'data', 2);
            });

            test('has too many items', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id(),
                customerDataFactory.id(), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooManyItemsValidationError('body', 'data', 2);
            });

            test('items are the same', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentA), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Customer cannot be blacklisted with itself');
            });
          });

          test.describe('if body[0]', () => {
            test('is not mongo id', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id('not-mongo-id'),
                customerDataFactory.id(), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('body', 'data/0');
            });

            test('does not belong to any customer', async ({ requestRemoveCustomerFromBlacklist, saveCustomers }) => {
              await saveCustomers(customerDocumentB, alreadyBlacklistedCustomer);
              const res = await requestRemoveCustomerFromBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              customerApiExpect(res).toBeNotFoundResponse();
              customerApiExpect(res).toHaveMessage('No customer found');
            });
          });

          test.describe('if body[1]', () => {
            test('is not mongo id', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id('not-mongo-id'), 
              ]);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('body', 'data/1');
            });

            test('does not belong to any customer', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocumentA);
              await savePrice(priceDocument);
              const res = await requestRemoveCustomerFromBlacklist([
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
