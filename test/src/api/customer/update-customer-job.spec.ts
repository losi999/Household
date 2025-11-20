import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries, getCustomerId, getPriceId } from '@household/shared/common/utils';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('PUT customer/v1/customers/{customerId}/jobs/{jobName}', () => {
  let request: Customer.Job.Request;
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;
  let jobName: string;

  beforeEach(() => {
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateCustomerJob(customerDataFactory.id(), jobName, request)
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateCustomerJob(customerDataFactory.id(), jobName, request)
            .expectForbiddenResponse();
        });
      } else {
        it('should update customer job', () => {
          cy.saveCustomerDocuments([
            customerDocument,
            blacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, request)
            .expectNoContentResponse()
            .validateCustomerJobUpdated(customerDocument, jobName, request);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    name: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    name: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    name: '',
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in use by a different job on the same customer', () => {
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

              cy.saveCustomerDocument(customerDocument)
                .authenticate(userType)
                .requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate customer job name');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    description: <any>1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    description: '',
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if duration', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    duration: undefined,
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('duration', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    duration: 1.1,
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('duration', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  body: {
                    duration: 0,
                  },
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('duration', 0, true, 'body');
            });

          });

          describe('if prices', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                  ...customerDataFactory.jobRequest(),
                  prices: undefined,
                })
                .expectBadRequestResponse()
                .expectRequiredProperty('prices', 'body');
            });

            it('is not array', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                  ...customerDataFactory.jobRequest(),
                  prices: <any>{},
                })
                .expectBadRequestResponse()
                .expectWrongPropertyType('prices', 'array', 'body');
            });

            it('has too few items', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                  ...customerDataFactory.jobRequest(),
                  prices: [],
                })
                .expectBadRequestResponse()
                .expectTooFewItemsProperty('prices', 1, 'body');
            });
          });

          describe('if prices[0]', () => {
            it('is not object', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                  ...customerDataFactory.jobRequest(),
                  prices: [1] as any,
                })
                .expectBadRequestResponse()
                .expectWrongPropertyType('prices/0', 'object', 'body');
            });

            it('has additional properties', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, {
                  ...customerDataFactory.jobRequest(),
                  prices: [
                    {
                      extra: 1,
                    },
                  ] as any,
                })
                .expectBadRequestResponse()
                .expectAdditionalProperty('prices/0', 'body');
            });
          });

          describe('if prices[0].priceId', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        priceId: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('priceId', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        priceId: <any>1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('priceId', 'string', 'body');
            });

            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        priceId: <any>'not mongo id',
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('priceId', 'body');
            });

            it('does not belong to any price', () => {
              cy.saveCustomerDocument(customerDocument)
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestUpdateCustomerJob(getCustomerId(customerDocument), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        priceId: priceDataFactory.id(),
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectMessage('Some of the prices are not found');
            });
          });

          describe('if prices[0].quantity', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        quantity: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('quantity', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        quantity: <any>1.1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('quantity', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    listed: [
                      {
                        quantity: 0,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('quantity', 0, true, 'body');
            });
          });

          describe('if prices[0].name', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    custom: [
                      {
                        name: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    custom: [
                      {
                        name: <any>1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    custom: [
                      {
                        name: '',
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 0, 'body');
            });
          });

          describe('if prices[0].amount', () => {
            it('is missing', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    custom: [
                      {
                        amount: undefined,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('amount', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, customerDataFactory.jobRequest({
                  prices: {
                    custom: [
                      {
                        amount: <any>1.1,
                      },
                    ],
                  },
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('amount', 'integer', 'body');
            });
          });

          describe('if customerId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id('not-valid'), jobName, request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('customerId', 'pathParameters');
            });

            it('does not belong to any customer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomerJob(customerDataFactory.id(), jobName, request)
                .expectNotFoundResponse()
                .expectMessage('No customer found');
            });
          });

          describe('if jobName', () => {
            it('does not belong to any customer job', () => {
              cy.saveCustomerDocuments([
                customerDocument,
                blacklistedCustomer,
              ])
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestUpdateCustomerJob(getCustomerId(customerDocument), 'not-existing-job-name', request)
                .expectNotFoundResponse()
                .expectMessage('No customer job found');
            });
          });
        });
      }
    });
  });
});
