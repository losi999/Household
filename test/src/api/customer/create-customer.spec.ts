import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { customerService } from '@household/test/dependencies';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

test.describe('POST customer/v1/customers', () => {
  let request: Customer.Request;

  test.beforeEach(async () => {
    request = customerDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateCustomer }) => {
      const res = await requestCreateCustomer(request);
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
        test('should return forbidden', async ({ requestCreateCustomer }) => {
          const res = await requestCreateCustomer(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create customer', async ({ requestCreateCustomer }) => {
          const res = await requestCreateCustomer(request);
          expect(res).toBeCreatedResponse();

          const { customerId } = (await res.json()) as Customer.CustomerId;
          expect(request).toBeStoredInDatabase(await customerService.findCustomerById(customerId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer({
                ...request,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                name: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different customer', async ({ requestCreateCustomer }) => {
              const customerDocument = customerDataFactory.document({
                body: request,
              });

              await customerService.saveCustomer(customerDocument);
              const res = await requestCreateCustomer(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate customer name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                description: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if isGroup', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                isGroup: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'isGroup');
            });

            test('is not boolean', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                isGroup: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'isGroup', 'boolean');
            });
          });

          test.describe('if rating', () => {
            test('is missing from body', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'rating');
            });

            test('is not integer', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 1.5, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'rating', 'integer');
            });

            test('is too small', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 0, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooSmallValidationError('body', 'rating', 1);
            });

            test('is too large', async ({ requestCreateCustomer }) => {
              const res = await requestCreateCustomer(customerDataFactory.request({
                rating: 6, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooLargeValidationError('body', 'rating', 5);
            });
          });
        });
      }
    });
  });
});
