import { entries, getCustomerId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Customer, Price } from '@household/shared/types/types';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { priceDataFactory } from '@household/test/api/price/data-factory';

const permissionMap = allowUsers('hairdresser');

describe('PUT /customer/v1/customers/{customerId}', () => {
  let request: Customer.Request;
  let customerDocument: Customer.Document;
  let blacklistedCustomer: Customer.Document;
  let priceDocument: Price.Document;

  beforeEach(() => {
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateCustomer(customerDataFactory.id(), request)
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
            .requestUpdateCustomer(customerDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        it('should update a customer', () => {
          cy.saveCustomerDocuments([
            customerDocument,
            blacklistedCustomer,
          ])
            .savePriceDocument(priceDocument)
            .authenticate(userType)
            .requestUpdateCustomer(getCustomerId(customerDocument), request)
            .expectCreatedResponse()
            .validateCustomerDocument(request, customerDocument);
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in use by a different customer', () => {
              const updatedCustomerDocument = customerDataFactory.document({
                body: request,
              });

              cy.saveCustomerDocuments([
                customerDocument,
                updatedCustomerDocument,
              ])
                .savePriceDocument(priceDocument)
                .authenticate(userType)
                .requestUpdateCustomer(getCustomerId(customerDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate customer name');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if isGroup', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  isGroup: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('isGroup', 'body');
            });

            it('is not boolean', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  isGroup: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('isGroup', 'boolean', 'body');
            });
          });

          describe('if rating', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  rating: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('rating', 'body');
            });

            it('is not integer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  rating: 1.5,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('rating', 'integer', 'body');
            });

            it('is too small', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  rating: 0,
                }))
                .expectBadRequestResponse()
                .expectTooSmallNumberProperty('rating', 1, false, 'body');
            });

            it('is too large', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), customerDataFactory.request({
                  rating: 6,
                }))
                .expectBadRequestResponse()
                .expectTooLargeNumberProperty('rating', 5, false, 'body');
            });
          });

          describe('if customerId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('customerId', 'pathParameters');
            });

            it('does not belong to any customer', () => {
              cy.authenticate(userType)
                .requestUpdateCustomer(customerDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
