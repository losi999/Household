import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { test, expect as domainExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { customerService, priceService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('PUT customer/v1/customers/blacklist', () => {
  let customerDocumentA: Customer.Document;
  let customerDocumentB: Customer.Document;
  let alreadyBlacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();

    alreadyBlacklistedCustomer = customerDataFactory.document();

    customerDocumentA = customerDataFactory.document({
      blacklistedCustomers: [alreadyBlacklistedCustomer],
    });
    customerDocumentB = customerDataFactory.document({
      jobs: [
        {
          prices: {
            custom: [],
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
    test('should return unauthorized', async ({ requestAddCustomerToBlacklist }) => {
      const res = await requestAddCustomerToBlacklist([
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
        test('should return forbidden', async ({ requestAddCustomerToBlacklist }) => {
          const res = await requestAddCustomerToBlacklist([
            customerDataFactory.id(),
            customerDataFactory.id(), 
          ]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should add customer to blacklist', async ({ requestAddCustomerToBlacklist }) => {
          await customerService.saveCustomers(customerDocumentA, customerDocumentB, alreadyBlacklistedCustomer);
          await priceService.savePrice(priceDocument);
          const res = await requestAddCustomerToBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          expect(res).toBeNoContentResponse();
          expect(customerDocumentA).toHaveBeenAddedToBlacklist(customerDocumentB, await customerService.getCustomerById(getCustomerId(customerDocumentB)));
          expect(customerDocumentB).toHaveBeenAddedToBlacklist(customerDocumentA, await customerService.getCustomerById(getCustomerId(customerDocumentA)));
        });

        test('should handle if customers are already added to blacklist', async ({ requestAddCustomerToBlacklist }) => {
          customerDocumentA = customerDataFactory.document({
            blacklistedCustomers: [customerDocumentB],
          });

          await customerService.saveCustomers(customerDocumentA, customerDocumentB);
          await priceService.savePrice(priceDocument);
          const res = await requestAddCustomerToBlacklist([
            getCustomerId(customerDocumentA),
            getCustomerId(customerDocumentB), 
          ]);
          expect(res).toBeNoContentResponse();
          expect(customerDocumentA).toHaveBeenAddedToBlacklist(customerDocumentB, await customerService.getCustomerById(getCustomerId(customerDocumentB)));
          expect(customerDocumentB).toHaveBeenAddedToBlacklist(customerDocumentA, await customerService.getCustomerById(getCustomerId(customerDocumentA)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not array', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist(<any>{});
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('is has to few items', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([customerDataFactory.id()]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 2);
            });

            test('has too many items', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id(),
                customerDataFactory.id(), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooManyItemsValidationError('body', 'data', 2);
            });

            test('items are the same', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentA), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Customer cannot be blacklisted with itself');
            });
          });

          test.describe('if body[0]', () => {
            test('is not mongo id', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id('not-mongo-id'),
                customerDataFactory.id(), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });

            test('does not belong to any customer', async ({ requestAddCustomerToBlacklist }) => {
              await customerService.saveCustomer(customerDocumentB);
              await priceService.savePrice(priceDocument);
              const res = await requestAddCustomerToBlacklist([
                getCustomerId(customerDocumentA),
                getCustomerId(customerDocumentB), 
              ]);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer found');
            });
          });

          test.describe('if body[1]', () => {
            test('is not mongo id', async ({ requestAddCustomerToBlacklist }) => {
              const res = await requestAddCustomerToBlacklist([
                customerDataFactory.id(),
                customerDataFactory.id('not-mongo-id'), 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/1');
            });

            test('does not belong to any customer', async ({ requestAddCustomerToBlacklist }) => {
              await customerService.saveCustomers(customerDocumentA, alreadyBlacklistedCustomer);
              const res = await requestAddCustomerToBlacklist([
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
