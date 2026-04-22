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

test.describe('DELETE customer/v1/customers/{customerId}/jobs/{jobName}', () => {
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;
  let jobName: string;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();
    blacklistedCustomer = customerDataFactory.document();

    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
      jobs: [
        {},
        {
          prices: {
            custom: [{}],
            listed: [
              {
                price: priceDocument,
                quantity: 1,
              },
            ],
          },
        },
      ],
    });

    jobName = customerDocument.jobs[0].name;
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCustomerJob }) => {
      const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
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
        test('should return forbidden', async ({ requestDeleteCustomerJob }) => {
          const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove customer job', async ({ requestDeleteCustomerJob, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestDeleteCustomerJob(getCustomerId(customerDocument), jobName);
          expect(res).toBeNoContentResponse();
          expect(jobName).toHaveBeenRemovedFromCustomerJobs(customerDocument, await getCustomerById(getCustomerId(customerDocument)));
        });

        test.describe('should return error', () => {
          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestDeleteCustomerJob }) => {
              const res = await requestDeleteCustomerJob(customerDataFactory.id('not-valid'), jobName);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestDeleteCustomerJob }) => {
              const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
