import { default as schema } from '@household/test/schemas/customer-response';
import { Customer, Price } from '@household/shared/types/types';
import { entries, getCustomerId } from '@household/shared/common/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { test, expect as domainExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { customerService, priceService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('GET /customer/v1/customers/{customerId}', () => {
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    blacklistedCustomer = customerDataFactory.document();
    priceDocument = priceDataFactory.document();

    customerDocument = customerDataFactory.document({
      blacklistedCustomers: [blacklistedCustomer],
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
    test('should return unauthorized', async ({ requestGetCustomer }) => {
      const res = await requestGetCustomer(customerDataFactory.id());
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
        test('should return forbidden', async ({ requestGetCustomer }) => {
          const res = await requestGetCustomer(customerDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get customer by id', async ({ requestGetCustomer }) => {
          await customerService.saveCustomers(customerDocument, blacklistedCustomer);
          await priceService.savePrice(priceDocument);
          const res = await requestGetCustomer(getCustomerId(customerDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchCustomerDocument(customerDocument);
        });

        test.describe('should return error if customerId', () => {
          test('is not mongo id', async ({ requestGetCustomer }) => {
            const res = await requestGetCustomer(customerDataFactory.id('not-valid'));
            expect(res).toBeBadRequestResponse();
            expect(res).toHavePatternValidationError('pathParameters', 'customerId');
          });

          test('does not belong to any customer', async ({ requestGetCustomer }) => {
            const res = await requestGetCustomer(customerDataFactory.id());
            expect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
