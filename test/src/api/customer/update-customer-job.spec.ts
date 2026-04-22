import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

import { test as customerApiTest, expect as customerApiExpect } from '@household/test/fixtures/customer-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as priceDbTest } from '@household/test/fixtures/price-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(customerApiExpect, apiExpect);

const permissionMap = allowUsers('hairdresser');

const test = mergeTests(customerApiTest, priceDbTest, customerDbTest);

test.describe('PUT customer/v1/customers/{customerId}/jobs/{jobName}', () => {
  let request: Customer.Job.Request;
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

    request = customerDataFactory.jobRequest({
      prices: {
        custom: [
          {},
          {},
        ],
        listed: [
          {
            priceId: getPriceId(priceDocument),
            quantity: 2,
          },
        ],
      },
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateCustomerJob }) => {
      const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, request);
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
        test('should return forbidden', async ({ requestUpdateCustomerJob }) => {
          const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update customer job', async ({ requestUpdateCustomerJob, savePrice, saveCustomers, getCustomerById }) => {
          await saveCustomers(customerDocument, blacklistedCustomer);
          await savePrice(priceDocument);
          const res = await requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, request);
          expect(res).toBeNoContentResponse();
          expect(request).toHaveBeenUpdatedInCustomerJobs(jobName, customerDocument, await getCustomerById(getCustomerId(customerDocument)));
        });

        test.describe('should return error', () => {        
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...request,
                extraProperty: 'extra',
              } as any);
                    
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  name: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  name: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  name: '', 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different job on the same customer', async ({ requestUpdateCustomerJob, saveCustomer }) => {
              const existingJobName = 'job name already used';
              const customerDocument = customerDataFactory.document({
                jobs: [
                  {},
                  {
                    body: {
                      name: existingJobName,
                    },
                  },
                ],
              });

              jobName = customerDocument.jobs[0].name;

              request = customerDataFactory.jobRequest({
                body: {
                  name: existingJobName,
                },
              });

              await saveCustomer(customerDocument);
              const res = await requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate customer job name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  description: <any>1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  description: '', 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if duration', () => {
            test('is missing from body', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  duration: undefined, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'duration');
            });

            test('is not integer', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  duration: 1.1, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'duration', 'integer');
            });

            test('is too small', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                body: {
                  duration: 0, 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'duration', 0);
            });

          });

          test.describe('if prices', () => {
            test('is missing from body', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...customerDataFactory.jobRequest(),
                prices: undefined, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'prices');
            });

            test('is not array', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...customerDataFactory.jobRequest(),
                prices: <any>{}, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'prices', 'array');
            });

            test('has too few items', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...customerDataFactory.jobRequest(),
                prices: [], 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'prices', 1);
            });
          });

          test.describe('if prices[0]', () => {
            test('is not object', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...customerDataFactory.jobRequest(),
                prices: [1] as any, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'prices/0', 'object');
            });

            test('has additional properties', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                ...customerDataFactory.jobRequest(),
                prices: [
                  {
                    extra: 1, 
                  }, 
                ] as any, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'prices/0', 'extra');
            });
          });

          test.describe('if prices[0].priceId', () => {
            test('is missing', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      priceId: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'priceId');
            });

            test('is not string', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      priceId: <any>1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'priceId', 'string');
            });

            test('is not mongo id', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      priceId: <any>'not mongo id', 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'priceId');
            });

            test('does not belong to any price', async ({ requestUpdateCustomerJob, savePrice, saveCustomer }) => {
              await saveCustomer(customerDocument);
              await savePrice(priceDocument);
              const res = await requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      priceId: priceDataFactory.id(), 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the prices are not found');
            });
          });

          test.describe('if prices[0].quantity', () => {
            test('is missing', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      quantity: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'quantity');
            });

            test('is not integer', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      quantity: <any>1.1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'integer');
            });

            test('is too small', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  listed: [
                    {
                      quantity: 0, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if prices[0].name', () => {
            test('is missing', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  custom: [
                    {
                      name: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  custom: [
                    {
                      name: <any>1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  custom: [
                    {
                      name: '', 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });
          });

          test.describe('if prices[0].amount', () => {
            test('is missing', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  custom: [
                    {
                      amount: undefined, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not integer', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                prices: {
                  custom: [
                    {
                      amount: <any>1.1, 
                    }, 
                  ], 
                }, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'amount', 'integer');
            });
          });

          test.describe('if customerId', () => {
            test('is not mongo id', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id('not-valid'), jobName, request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'customerId');
            });

            test('does not belong to any customer', async ({ requestUpdateCustomerJob }) => {
              const res = await requestUpdateCustomerJob(customerDataFactory.id(), jobName, request);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer found');
            });
          });

          test.describe('if jobName', () => {
            test('does not belong to any customer job', async ({ requestUpdateCustomerJob, savePrice, saveCustomers }) => {
              await saveCustomers(customerDocument, blacklistedCustomer);
              await savePrice(priceDocument);
              const res = await requestUpdateCustomerJob(getCustomerId(customerDocument), 'not-existing-job-name', request);
              expect(res).toBeNotFoundResponse();
              expect(res).toHaveMessage('No customer job found');
            });
          });
        });
      }
    });
  });
});
