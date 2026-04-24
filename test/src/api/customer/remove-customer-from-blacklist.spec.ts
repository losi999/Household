import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('DELETE customer/v1/customers/blacklist', () => {
  let customerDocumentA: Customer.Document;
  let customerDocumentB: Customer.Document;
  let alreadyBlacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

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
          prices: {
            custom: [{}],
            listed: [
              {
                price: priceDocument,
              },
            ],
          },
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
        test('should return forbidden', async ({ requestRemoveCustomerFromBlacklist }) => {
          const res = await requestRemoveCustomerFromBlacklist([
            customerDataFactory.id(),
            customerDataFactory.id(), 
          ]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove customer from blacklist', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestRemoveCustomerFromBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          expect(res).toBeNoContentResponse();
          expect(customerDocumentA).toHaveBeenRemovedFromBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          expect(customerDocumentB).toHaveBeenRemovedFromBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test('should handle if customers were already removed to blacklist', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestRemoveCustomerFromBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          expect(res).toBeNoContentResponse();
          expect(customerDocumentA).toHaveBeenRemovedFromBlacklist(customerDocumentB, await getCustomerById(getCustomerId(customerDocumentB)));
          expect(customerDocumentB).toHaveBeenRemovedFromBlacklist(customerDocumentA, await getCustomerById(getCustomerId(customerDocumentA)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not array', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist(<any>{});
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('is has to few items', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([customerDataFactory.id()]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 2);
            });

            test('has too many items', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id(),
                customerDataFactory.id(), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooManyItemsValidationError('body', 'data', 2);
            });

            test('items are the same', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentA), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Customer cannot be blacklisted with itself');
            });
          });

          test.describe('if body[0]', () => {
            test('is not mongo id', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id('not-mongo-id'),
                customerDataFactory.id(), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });

            test('does not belong to any customer', async ({ requestRemoveCustomerFromBlacklist, saveCustomers }) => {
              await saveCustomers(customerDocumentB, alreadyBlacklistedCustomer);
              const res = await requestRemoveCustomerFromBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer found');
            });
          });

          test.describe('if body[1]', () => {
            test('is not mongo id', async ({ requestRemoveCustomerFromBlacklist }) => {
              const res = await requestRemoveCustomerFromBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id('not-mongo-id'), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/1');
            });

            test('does not belong to any customer', async ({ requestRemoveCustomerFromBlacklist, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocumentA);
              await savePrice(priceDocument);
              const res = await requestRemoveCustomerFromBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
