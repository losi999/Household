import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { customerApiTest, customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { mergeTests } from '@playwright/test';
import { priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { customerDbTest } from '@household/test/fixtures/customer-db.fixture';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('POST customer/v1/customers/{customerId}/jobs', () => {
  let request: Requests.CustomerJob;
  let customerDocument: Documents.Customer;
  let priceDocument: Documents.Price;

  test.beforeEach(async () => {
    priceDocument = priceDataFactory.document();

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
    });

    request = customerDataFactory.jobRequest({
      prices: [
        {
          priceId: getPriceId(priceDocument),
        },
      ],
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateCustomerJob }) => {
      const res = await requestCreateCustomerJob(customerDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestCreateCustomerJob }) => {
          const res = await requestCreateCustomerJob(customerDataFactory.id(), request);
          customerApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should add customer job', () => {
          test('with complete body', async ({ requestCreateCustomerJob, savePrice, saveCustomer, getCustomerById }) => {
            await saveCustomer(customerDocument);
            await savePrice(priceDocument);
            const res = await requestCreateCustomerJob(getCustomerId(customerDocument), request);
            customerApiExpect(res).toBeCreatedResponse();
            customerApiExpect(request).toHaveBeenAddedToCustomerJobs(customerDocument, await getCustomerById(getCustomerId(customerDocument)));
          });

          test('without description', async ({ requestCreateCustomerJob, savePrice, saveCustomer, getCustomerById }) => {
            await saveCustomer(customerDocument);
            await savePrice(priceDocument);

            delete request.description;

            const res = await requestCreateCustomerJob(getCustomerId(customerDocument), request);
            customerApiExpect(res).toBeCreatedResponse();
            customerApiExpect(request).toHaveBeenAddedToCustomerJobs(customerDocument, await getCustomerById(getCustomerId(customerDocument)));
          });

          test('without additionalPrice', async ({ requestCreateCustomerJob, savePrice, saveCustomer, getCustomerById }) => {
            await saveCustomer(customerDocument);
            await savePrice(priceDocument);

            delete request.additionalPrice;

            const res = await requestCreateCustomerJob(getCustomerId(customerDocument), request);
            customerApiExpect(res).toBeCreatedResponse();
            customerApiExpect(request).toHaveBeenAddedToCustomerJobs(customerDocument, await getCustomerById(getCustomerId(customerDocument)));
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...request,
                extraProperty: 'extra',
              } as any);
            
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
                    
          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  name: undefined, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  name: <any>1, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  name: '', 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different job on the same customer', async ({ requestCreateCustomerJob, saveCustomer, savePrice }) => {
              const customerDocument = customerDataFactory.document({
                jobs: [
                  {
                    body: {
                      name: request.name,
                    },
                    prices: [
                      {
                        price: priceDocument,
                      },
                    ],
                  },
                ],
              });

              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCustomerJob(getCustomerId(customerDocument), request);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Duplicate customer job name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  description: <any>1, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  description: '', 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if duration', () => {
            test('is missing from body', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  duration: undefined, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'duration');
            });

            test('is not integer', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  duration: 1.1, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'duration', 'integer');
            });

            test('is too small', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                body: {
                  duration: 0, 
                }, 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'duration', 0);
            });

          });

          test.describe('if prices', () => {
            test('is missing from body', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...customerDataFactory.jobRequest(),
                prices: undefined, 
              });
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'prices');
            });

            test('is not array', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...customerDataFactory.jobRequest(),
                prices: <any>{}, 
              });
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'prices', 'array');
            });

            test('has too few items', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...customerDataFactory.jobRequest(),
                prices: [], 
              });
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveTooFewItemsValidationError('body', 'prices', 1);
            });
          });

          test.describe('if prices[0]', () => {
            test('is not object', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...customerDataFactory.jobRequest(),
                prices: [1] as any, 
              });
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'prices/0', 'object');
            });

            test('has additional properties', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), {
                ...customerDataFactory.jobRequest(),
                prices: [
                  {
                    extra: 1, 
                  }, 
                ] as any, 
              });
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'prices/0', 'extra');
            });
          });

          test.describe('if prices[0].priceId', () => {
            test('is missing', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    priceId: undefined, 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'priceId');
            });

            test('is not string', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    priceId: <any>1, 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'priceId', 'string');
            });

            test('is not mongo id', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    priceId: <any>'not mongo id', 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('body', 'priceId');
            });

            test('does not belong to any price', async ({ requestCreateCustomerJob, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestCreateCustomerJob(getCustomerId(customerDocument), customerDataFactory.jobRequest({
                prices: [
                  {
                    priceId: priceDataFactory.id(), 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveMessage('Some of the prices are not found');
            });
          });

          test.describe('if prices[0].quantity', () => {
            test('is missing', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    quantity: undefined, 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveRequiredPropertyValidationError('body', 'quantity');
            });

            test('is not number', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    quantity: <any> '1', 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), customerDataFactory.jobRequest({
                prices: [
                  {
                    quantity: 0, 
                  }, 
                ], 
              }));
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id('not-valid'), request);
              customerApiExpect(res).toBeBadRequestResponse();
              customerApiExpect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestCreateCustomerJob }) => {
              const res = await requestCreateCustomerJob(customerDataFactory.id(), request);
              customerApiExpect(res).toBeNotFoundResponse();
              customerApiExpect(res).toHaveMessage('No customer found');
            });
          });
        });
      }
    });
  });
});
