import { entries, getCustomerId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';
import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('PUT /customer/v1/customers/{customerId}', () => {
  let request: Requests.Customer;
  let customerDocument: Documents.Customer;
  let blacklistedCustomer: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    request = customerDataFactory.request();

    priceDocument = priceDataFactory.document();
    blacklistedCustomer = customerDataFactory.document();

    customerDocument = customerDataFactory.document({
      jobs: [
        {
          prices: [
            {
              price: priceDocument,
            },
          ],
        },
      ],
      blacklistedCustomers: [blacklistedCustomer],
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCustomer }) => {
      const res = await requestUpdateCustomer(customerDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateCustomer }) => {
          const res = await requestUpdateCustomer(customerDataFactory.id(), request);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update a customer', async ({ requestUpdateCustomer, savePrice, saveCustomers, findCustomerById }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestUpdateCustomer(getCustomerId(customerDocument), request);
          customerApiExpect(res).toBeNoContentResponse();
          customerApiExpect(request).toHaveBeenSavedAsCustomerDocument(await findCustomerById(getCustomerId(customerDocument)), customerDocument);
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
                  
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                name: '', 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different customer', async ({ requestUpdateCustomer, savePrice, saveCustomers }) => {
              const updatedCustomerDocument = customerDataFactory.document({
                body: request,
              });

              await saveCustomers(customerDocument, updatedCustomerDocument);
              await savePrice(priceDocument);
              const res = await requestUpdateCustomer(getCustomerId(customerDocument), request);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Duplicate customer name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                description: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                description: '', 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if isGroup', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                isGroup: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'isGroup');
            });

            test('is not boolean', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                isGroup: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'isGroup', 'boolean');
            });
          });

          test.describe('if rating', () => {
            test('is missing from body', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'rating');
            });

            test('is not integer', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 1.5, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'rating', 'integer');
            });

            test('is too small', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 0, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooSmallValidationError('body', 'rating', 1);
            });

            test('is too large', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                rating: 6, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooLargeValidationError('body', 'rating', 5);
            });
          });

          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id('not-valid'), request);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestUpdateCustomer }) => {
              const res = await requestUpdateCustomer(customerDataFactory.id(), request);
              customerApiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
