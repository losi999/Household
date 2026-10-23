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

test.describe('DELETE customer/v1/customers/{customerId}/jobs/{jobName}', () => {
  let customerDocument: Documents.Customer;
  let blacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;
  let jobName: string;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();
    blacklistedCustomer = customerDataFactory.document();

    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
      jobs: [
        {
          prices: undefined, // TODO ???
        },
        {
          prices: [
            {
              price: priceDocument,
              quantity: 1,
            },
          ],
        },
      ],
    });

    jobName = customerDocument.jobs[0].name;
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCustomerJob }) => {
      const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
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
        test('should return forbidden', async ({ requestDeleteCustomerJob }) => {
          const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove customer job', async ({ requestDeleteCustomerJob, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestDeleteCustomerJob(getCustomerId(customerDocument), jobName);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(jobName).toHaveBeenRemovedFromCustomerJobs(customerDocument, await getCustomerById(getCustomerId(customerDocument)));
        });

        test.describe('should return error', () => {
          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestDeleteCustomerJob }) => {
              const res = await requestDeleteCustomerJob(customerDataFactory.id('not-valid'), jobName);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestDeleteCustomerJob }) => {
              const res = await requestDeleteCustomerJob(customerDataFactory.id(), jobName);
              customerApiExpect(res).toBeNotFoundResponse();
              customerApiExpect(res).toHaveMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
