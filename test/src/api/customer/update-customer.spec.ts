import { entries, getCustomerId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('PUT /customer/v1/customers/{customerId}', () => {
  let request: Customer.Request;
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  test.beforeEach(async () => {
    request = customerDataFactory.request();

    priceDocument = priceDataFactory.document();
    blacklistedCustomer = customerDataFactory.document();

    customerDocument = customerDataFactory.document({
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
      blacklistedCustomers: [blacklistedCustomer],
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCustomer }) => {
      const res = await requestUpdateCustomer(customerDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateCustomer }) => {
          const res = await requestUpdateCustomer(customerDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update a customer', async ({ requestUpdateCustomer, savePrice, saveCustomers, findCustomerById }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestUpdateCustomer(getCustomerId(customerDocument), request);
          expect(res).toBeCreatedResponse();

          const { customerId } = (await res.json()) as Customer.CustomerId;
          expect(request).toHaveBeenSavedAsCustomerDocument(await findCustomerById(customerId), customerDocument);
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
                  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different customer', async ({ requestUpdateCustomer, savePrice, saveCustomers }) => {
              const updatedCustomerDocument = customerDataFactory.document({
                body: request,
              });

              await saveCustomers(customerDocument, updatedCustomerDocument);
              await savePrice(priceDocument);
              const res = await requestUpdateCustomer(getCustomerId(customerDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate customer name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                description: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if isGroup', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                isGroup: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'isGroup');
            });

            test('is not boolean', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                isGroup: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'isGroup', 'boolean');
            });
          });

          test.describe('if rating', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'rating');
            });

            test('is not integer', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 1.5, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'rating', 'integer');
            });

            test('is too small', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooSmallValidationError('body', 'rating', 1);
            });

            test('is too large', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 6, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'rating', 5);
            });
          });

          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
