import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId } from '@household/shared/common/utils';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Requests } from '@household/shared/types/requests';
import { Api } from '@household/shared/types/api';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, customerDbTest);

test.describe('POST customer/v1/customers', () => {
  let request: Requests.Customer;

  test.beforeEach(async () => {
    request = customerDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateCustomer }) => {
      const res = await requestCreateCustomer(request);
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
        test('should return forbidden', async ({ requestCreateCustomer }) => {
          const res = await requestCreateCustomer(request);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create customer', async ({ requestCreateCustomer, findCustomerById }) => {
          const res = await requestCreateCustomer(request);
          customerApiExpect(res).toBeCreatedResponse();

          const { customerId } = (await res.json()) as Api.Customer.CustomerId;
          customerApiExpect(request).toHaveBeenSavedAsCustomerDocument(await findCustomerById(customerId));
        });

        test('should rename archived customer if names collide', async ({ requestCreateCustomer, saveCustomer, findCustomerById }) => {
          const archivedCustomerDocument = {
            ...customerDataFactory.document({
              body: {
                name: request.name,
              },
            }),
            isArchived: true,
          };
        
          await saveCustomer(archivedCustomerDocument);
          const res = await requestCreateCustomer(request);
          customerApiExpect(res).toBeCreatedResponse();
        
          const { customerId } = (await res.json()) as Api.Customer.CustomerId;
          customerApiExpect(request).toHaveBeenSavedAsCustomerDocument(await findCustomerById(customerId));
          customerApiExpect(archivedCustomerDocument).toHaveBeenRenamed(await findCustomerById(getCustomerId(archivedCustomerDocument)));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: '', 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different customer', async ({ requestCreateCustomer, saveCustomer }) => {
              const customerDocument = customerDataFactory.document({
                body: request,
              });

              await saveCustomer(customerDocument);
              const res = await requestCreateCustomer(request);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Duplicate customer name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                description: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                description: '', 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if isGroup', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                isGroup: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'isGroup');
            });

            test('is not boolean', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                isGroup: <any>1, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'isGroup', 'boolean');
            });
          });

          test.describe('if rating', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: undefined, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'rating');
            });

            test('is not integer', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 1.5, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'rating', 'integer');
            });

            test('is too small', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 0, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooSmallValidationError('body', 'rating', 1);
            });

            test('is too large', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 6, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooLargeValidationError('body', 'rating', 5);
            });
          });
        });
      }
    });
  });
});
